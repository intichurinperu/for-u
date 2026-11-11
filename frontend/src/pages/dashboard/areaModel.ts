import {validGuidance} from '../../ai/model';
import {randomId} from '../../lib/randomId';
import type { ModuleType } from '../../modules/moduleProjects';
export const areaDefinitions = [
  { id: 'marketing', title: 'Marketing', color: '#D9B46B', pet: 'Oliver', gradient: 'from-amber-100 via-amber-200 to-pink-100', accessory: '🎨' },
  { id: 'finance', title: 'Finanzas', color: '#A9E8D7', pet: 'Shippo', gradient: 'from-pink-100 via-pink-200 to-purple-100', accessory: '🌱' },
  { id: 'logistics', title: 'Logística', color: '#C7B4E4', pet: 'Emma', gradient: 'from-purple-100 via-purple-200 to-cyan-100', accessory: '🧭' },
  { id: 'operations', title: 'Operaciones', color: '#B9DCD7', pet: 'Munay', gradient: 'from-cyan-100 via-cyan-200 to-amber-100', accessory: '💌' },
] as const;
export type AreaId = typeof areaDefinitions[number]['id'];
export type AreaTask = { status?: 'todo' | 'doing' | 'done'; date?: string; guidance?: import('../../ai/model').Guidance; id: string; area: AreaId; title: string; done: boolean; createdAt: string; completedAt?: string; firstCompletedAt?: string; tool?: string };
export type AreaTasks = { version: 1 | 2; tasks: AreaTask[]; earnedAreas?: AreaId[] };
export type WorldState = { version: 1; areas: Partial<Record<AreaId, { decoration: number; searchReward: boolean; taskReward: boolean }>> };
export function parseAreaTasks(value: unknown): AreaTasks {
  const doc = value as AreaTasks;
  const ids = new Set<string>();
  if (!doc || ![1,2].includes(doc.version) || !Array.isArray(doc.tasks) || (doc.earnedAreas !== undefined && (!Array.isArray(doc.earnedAreas) || !doc.earnedAreas.every(area => areaDefinitions.some(a => a.id === area)))) || !doc.tasks.every(task => {
    if (!task || typeof task.id !== 'string' || ids.has(task.id) || !areaDefinitions.some(a => a.id === task.area) || typeof task.title !== 'string' || !task.title.trim() || task.title.length > 200 || (task.guidance!==undefined&&!validGuidance(task.guidance)) || (task.status!==undefined&&!['todo','doing','done'].includes(task.status)) || (task.date!==undefined&&(!validTaskDate(task.date))) || typeof task.done !== 'boolean' || typeof task.createdAt !== 'string') return false;
    ids.add(task.id); return true;
  })) throw new Error('No se pudo interpretar la lista de tareas. Tus datos guardados no se modificaron.');
  return doc;
}
export function parseWorldState(value: unknown): WorldState {
  const doc = value as WorldState;
  if (!doc || doc.version !== 1 || !doc.areas || typeof doc.areas !== 'object' || Array.isArray(doc.areas) || !Object.entries(doc.areas).every(([area, state]) => areaDefinitions.some(a => a.id === area) && state && [0, 1, 2].includes(state.decoration) && typeof state.searchReward === 'boolean' && typeof state.taskReward === 'boolean' && (state.decoration !== 1 || state.searchReward) && (state.decoration !== 2 || state.taskReward))) throw new Error('No se pudo interpretar la decoración. Tus datos guardados no se modificaron.');
  return doc;
}
export const isSavedProject = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export function initialTasks(type: ModuleType): AreaTasks {
  const offer = { restaurant: 'platos', ecommerce: 'productos', hospitality: 'habitaciones', tourism: 'experiencias', courses: 'cursos' }[type];
  const definitions: Record<AreaId, [string, string][]> = {
    marketing: [['Definir mi mensaje', 'content'], ['Crear mi primera pieza', 'creator'], ['Preparar mi página', 'editor']],
    finance: [[`Agregar mis ${offer}`, 'editor'], ['Establecer mis precios', 'editor'], ['Revisar mis costos', 'summary']],
    logistics: [['Planificar una actividad', 'calendar'], ['Revisar disponibilidad', 'summary'], ['Organizar entregas o agenda', 'calendar']],
    operations: [['Configurar mi contacto', 'editor'], ['Definir cómo recibir solicitudes', 'bookings'], ['Preparar una respuesta', 'automation']],
  };
  return { version: 1, tasks: areaDefinitions.flatMap(area => definitions[area.id].map(([title, tool]) => ({ id: randomId(), area: area.id, title, tool, done: false, createdAt: new Date().toISOString() }))) };
}
export function areaProgress(tasks: AreaTask[], area: AreaId) {
  const own = tasks.filter(task => task.area === area);
  const completed = own.filter(task => task.done).length;
  return { total: own.length, completed, percent: own.length ? Math.round(completed / own.length * 100) : 0, complete: own.length > 0 && completed === own.length };
}
export function rewardTask(world: WorldState, area: AreaId): WorldState {
  const value = world.areas[area] ?? { decoration: 0, searchReward: false, taskReward: false };
  return { ...world, areas: { ...world.areas, [area]: { ...value, taskReward: true } } };
}
export function mascotMessage(area: AreaId, type: ModuleType, tasks: AreaTask[]) {
  const next = tasks.find(task => task.area === area && !task.done);
  const name = areaDefinitions.find(item => item.id === area)!.pet;
  return { message: next ? `Soy ${name}. Podemos empezar por «${next.title}». Un paso a la vez; también puedes descansar conmigo.` : `Soy ${name}. Aquí no quedan pendientes. Puedes añadir una idea o jugar un rato.`, taskId: next?.id, businessType: type };
}
export function areaToolPath(tool: string, type: ModuleType, project: string) {
  const query = `?project=${encodeURIComponent(project)}`;
  if (tool === 'orders') return type === 'restaurant' ? `/modules/restaurant/orders${query}` : `/dashboard${query}`;
  if (tool === 'commerce-orders') return `/dashboard/tools/orders${query}`;
  if (tool === 'editor') return `/modules/${type}/editor${query}`;
  if (tool === 'summary') return `/modules/${type}${query}`;
  if (tool === 'kanban') return `/dashboard${query}&view=kanban`;
  if (tool === 'studio') return `/creator-studio${query}`;
  if (tool === 'creator') return `/content-creator${query}`;
  return `/dashboard/tools/${tool}${query}`;
}

// Claims travel with task writes, including deletion, so a partial decoration write cannot lose them.
function taskClaims(tasks:AreaTasks):AreaId[]{return areaDefinitions.filter(area=>tasks.earnedAreas?.includes(area.id)||tasks.tasks.some(task=>task.area===area.id&&(task.done||typeof task.firstCompletedAt==='string'&&Number.isFinite(Date.parse(task.firstCompletedAt))))).map(area=>area.id);}
export function recordTaskClaims(previous:AreaTasks,next:AreaTasks):AreaTasks {const claims=areaDefinitions.filter(a=>taskClaims(previous).includes(a.id)||taskClaims(next).includes(a.id)).map(a=>a.id);return claims.length?{...next,earnedAreas:claims}:next;}
export function recoveredTaskRewards(world:WorldState,tasks:AreaTasks):WorldState {let next=world;for(const area of taskClaims(tasks))next=rewardTask(next,area);return next;}

export function taskStatus(task:AreaTask):'todo'|'doing'|'done'{return task.done?'done':task.status==='doing'?'doing':'todo';}
export function updateTaskState(task:AreaTask,status:'todo'|'doing'|'done'):AreaTask{return {...task,status,done:status==='done',completedAt:status==='done'?(task.completedAt??new Date().toISOString()):undefined};}

export function validTaskDate(value:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;}
