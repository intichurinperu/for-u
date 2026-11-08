import {destinationPath,destinationMatchesRoute,validDestination,type ProjectDestination} from '../../workspace/navigation';
import { areaDefinitions, areaToolPath, isSavedProject, type AreaId } from './areaModel';
import type { ModuleType } from '../../modules/moduleProjects';

export const taskTools = [
  ['profile', 'Mi perfil y publicaciones'], ['proposal', 'Mi propuesta'], ['landing', 'Mi página'], ['editor', 'Editar oferta'], ['summary', 'Resumen del negocio'],
  ['studio', 'Creator Studio'], ['video', 'Editor de video'], ['kanban', 'Mi Kanban'], ['creator', 'Creador visual'], ['content', 'Contenido con IA'], ['teleprompter', 'Teleprompter'],
  ['orders', 'Pedidos internos de restaurante'], ['commerce-orders', 'Compras y cotizaciones'], ['calendar', 'Calendario'], ['bookings', 'Reservas y pedidos'], ['automation', 'Contacto y respuestas'],
  ['images', 'Uploads'], ['analytics', 'Estadísticas'],
] as const;
export type TaskReference = { projectId: string; taskId: string };
export type LastWork = { projectId: string; area?: AreaId; taskId?: string; tool?: string; destination?: ProjectDestination };
type LegacyFocus = { version: 1; today: TaskReference[]; lastWork?: LastWork };
export type AccountPreferences = {version:1; preferredName:string; addressing:'neutral'|'feminine'|'masculine'|'at'; reducedMotion:boolean};
export const emptyAccountPreferences=():AccountPreferences=>({version:1,preferredName:'',addressing:'neutral',reducedMotion:false});
export function parseAccountPreferences(value:unknown):AccountPreferences {const p=value as AccountPreferences;if(!p||p.version!==1||typeof p.preferredName!=='string'||p.preferredName.length>120||!['neutral','feminine','masculine','at'].includes(p.addressing)||typeof p.reducedMotion!=='boolean')throw new Error('Las preferencias personales no son compatibles. Se conservaron sin sustituir.');return p;}
export type WorkspaceFocus = LegacyFocus | { version: 2; today: TaskReference[]; destinations: Record<string, LastWork> } | {version:3;today:TaskReference[];destinations:Record<string,LastWork>;preferences:AccountPreferences};
export const emptyFocus = (): WorkspaceFocus => ({ version: 1, today: [] });
export const sameTask = (a: TaskReference, b: TaskReference) => a.projectId === b.projectId && a.taskId === b.taskId;
export const knownTaskTool = (tool: unknown): tool is string => taskTools.some(([key]) => key === tool);

export function parseWorkspaceFocus(value: unknown): WorkspaceFocus {
  const doc = value as WorkspaceFocus;
  const validRef = (ref: TaskReference) => ref && isSavedProject(ref.projectId) && typeof ref.taskId === 'string' && ref.taskId.length > 0 && ref.taskId.length <= 200;
  const validWork = (work: LastWork) => work && isSavedProject(work.projectId)
    && (work.area === undefined || areaDefinitions.some(a => a.id === work.area))
    && (work.taskId === undefined || validRef({ projectId: work.projectId, taskId: work.taskId }))
    && (work.tool === undefined || work.tool === 'studio' || knownTaskTool(work.tool))
    && (work.destination===undefined||validDestination(work.destination));
  if (!doc || ![1, 2, 3].includes(doc.version) || !Array.isArray(doc.today) || doc.today.length > 3 || !doc.today.every(validRef)
    || doc.today.some((ref, i) => doc.today.slice(0, i).some(other => sameTask(ref, other)))
    || (doc.version === 1 && doc.lastWork !== undefined && !validWork(doc.lastWork))
    || (doc.version !== 1 && (!doc.destinations || typeof doc.destinations !== 'object' || Array.isArray(doc.destinations)
      || !Object.entries(doc.destinations).every(([id, work]) => validWork(work) && id === work.projectId)))) {
    throw new Error('No pudimos interpretar tu enfoque. No se modificaron tus preferencias guardadas.');
  }
  if(doc.version===3)parseAccountPreferences(doc.preferences);
  return doc;
}
// Reading legacy preferences leaves their format intact. Only an explicit edit upgrades them.
function editableFocus(doc: WorkspaceFocus): Extract<WorkspaceFocus, { version: 3 }> {
  parseWorkspaceFocus(doc);
  return doc.version === 3 ? doc : {version:3,today:doc.today,destinations:doc.version===2?doc.destinations:doc.lastWork?{[doc.lastWork.projectId]:doc.lastWork}:{},preferences:emptyAccountPreferences()};
}
export function projectDestination(doc: WorkspaceFocus, projectId: string): LastWork {
  return (doc.version !== 1 ? doc.destinations[projectId] : doc.lastWork?.projectId === projectId ? doc.lastWork : undefined) ?? { projectId };
}
export function rememberDestination(doc: WorkspaceFocus, work: LastWork): WorkspaceFocus {
  const next = editableFocus(doc);
  return parseWorkspaceFocus({ ...next, destinations: { ...next.destinations, [work.projectId]: work } });
}
export function taskDestination(projectId: string, task: { id: string; area: AreaId; tool?: string }): LastWork {
  return { projectId, area: task.area, taskId: task.id, ...(knownTaskTool(task.tool) ? { tool: task.tool } : {}) };
}
// A task starts its work directly. The area panel remains for organizing tasks.
export function taskWorkPath(projectId:string,task:{id:string;tool?:string},type:ModuleType):string|null {
  if(!knownTaskTool(task.tool))return null;
  if(task.tool==='studio')return `/creator-studio?${new URLSearchParams({project:projectId,tab:'create',start:'first-content',task:task.id})}`;
  return areaToolPath(task.tool,type,projectId);
}

export function routeTaskWorkPath(projectId:string,task:{id:string;tool?:string},type:ModuleType):string|null {
 const destination=taskWorkPath(projectId,task,type);
 if(!destination)return null;
 const [path,search]=destination.split('?');
 if(path==='/dashboard')return destination;
 const query=new URLSearchParams(search);
 query.set('task',task.id);
 return `${path}?${query}`;
}
export function toggleToday(doc: WorkspaceFocus, ref: TaskReference): WorkspaceFocus {
  doc = editableFocus(doc);
  if (doc.today.some(other => sameTask(ref, other))) return { ...doc, today: doc.today.filter(other => !sameTask(ref, other)) };
  if (doc.today.length >= 3) throw new Error('Elige hasta tres pasos para Hoy. Quita uno para añadir otro.');
  return parseWorkspaceFocus({ ...doc, today: [...doc.today, ref] });
}
export function resumePath(work: LastWork, type: ModuleType) {
  if(work.destination)return destinationMatchesRoute(work.destination,type)?destinationPath(work.projectId,work.destination):destinationPath(work.projectId,{path:'/dashboard',params:{view:'map'}});
  if (work.tool === 'studio') return work.taskId?taskWorkPath(work.projectId,{id:work.taskId,tool:work.tool},type)!:`/creator-studio?project=${encodeURIComponent(work.projectId)}`;
  if (knownTaskTool(work.tool)) return areaToolPath(work.tool, type, work.projectId);
  const query = new URLSearchParams({ project: work.projectId });
  if (work.area) query.set('area', work.area);
  if (work.taskId) query.set('task', work.taskId);
  return `/dashboard?${query}`;
}

export function accountPreferences(doc:WorkspaceFocus):AccountPreferences{return doc.version===3?doc.preferences:emptyAccountPreferences();}
export function changeAccountPreferences(doc:WorkspaceFocus,preferences:AccountPreferences):WorkspaceFocus{return parseWorkspaceFocus({...editableFocus(doc),preferences:parseAccountPreferences(preferences)});}
