import TaskSuggestion from '../../ai/TaskSuggestion';
import {randomId} from '../../lib/randomId';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Tooltip } from '../../components/ui/DesignSystem';
import AreaSaveStatus from './AreaSaveStatus';
import { usePomodoro } from '../../contexts/PomodoroContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ModuleType } from '../../modules/moduleProjects';
import { useWorkspaceFocus } from './WorkspaceFocus';
import { taskTools, knownTaskTool, sameTask, taskWorkPath } from './workspaceFocusModel';
import { useAreaDocuments } from './AreaDocuments';
import { areaDefinitions, areaProgress, areaToolPath, rewardTask, type AreaId } from './areaModel';

export default function AreaPanel({ projectId, type, area, play = false, initialTaskId, showHeading = true }: { projectId: string; type: ModuleType; area: AreaId; play?: boolean; initialTaskId?: string; showHeading?: boolean }) {
  const navigate=useNavigate();
  const { setAreaColor } = usePomodoro();
  useEffect(() => { setAreaColor(areaDefinitions.find(value => value.id === area)!.color); }, [area, setAreaColor]);
  const { entry, change, reload } = useAreaDocuments(projectId, type);
  const { state: focus, toggle, remember, save: saveFocus } = useWorkspaceFocus();
  const [title, setTitle] = useState('');
  const [tool, setTool] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [deleteTask, setDeleteTask] = useState<string|null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId ?? null);
  useEffect(() => { if (initialTaskId) setSelectedTaskId(initialTaskId); }, [initialTaskId]);
  const [mode, setMode] = useState<'work' | 'play'>(play ? 'play' : 'work');
  const [reaction, setReaction] = useState('');
  const [reactionId, setReactionId] = useState(0);
  const reactTo = (message: string) => { setReaction(message); setReactionId(value => value + 1); };
  const [found, setFound] = useState<number[]>([]);
  const meta = areaDefinitions.find(a => a.id === area)!;
  if (!entry?.loaded) return <section className="area-panel"><p role="status">{entry?.error || 'Preparando tus tareas…'}</p>{entry?.error && <DSButtonSecondary onClick={() => void reload()}>Reintentar carga</DSButtonSecondary>}</section>;
  const tasks = entry.tasks.tasks.filter(t => t.area === area);
  const selectedTask = tasks.find(task => task.id === selectedTaskId);
  const nextTask = tasks.find(task => !task.done);
  const nextPath = nextTask ? taskWorkPath(projectId,nextTask,type) : null;
  const visibleTasks = showAll ? tasks : [...tasks].sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 3);
  const state = entry.world.areas[area] ?? { decoration: 0, searchReward: false, taskReward: false };
  const progress = areaProgress(entry.tasks.tasks, area);
  const tools: Record<AreaId, [string, string][]> = { marketing: [['Mi perfil y publicaciones', 'profile'], ['Mi propuesta', 'proposal'], ['Diseñar para redes', 'creator'], ['Plantillas', 'landing&page=templates'], ['IA para contenido', 'content'], ['Teleprompter', 'teleprompter']], finance: [['Editar oferta', 'editor'], ['Ver resumen', 'summary']], logistics: [['Calendario', 'calendar'], ['Disponibilidad', 'summary']], operations: [...(type === 'restaurant' ? [['Pedidos internos', 'orders'] as [string,string]] : []), ['Reservas', 'bookings'], ['WhatsApp y respuestas', 'automation']] };
  const toolHelp: Record<string, string> = {
    profile: 'Organiza bio, destacados y piezas sin modificar Instagram.',
    creator: 'Crea piezas gráficas para redes sociales y expórtalas como imagen.',
    'landing&page=templates': 'Explora estilos para la página de tu negocio.',
    content: 'Prepara propuestas de contenido con IA y revísalas antes de usarlas.',
    teleprompter: 'Lee tu guion mientras preparas o grabas un video.',
    editor: 'Edita la oferta de este proyecto: productos, habitaciones, experiencias o cursos.',
    summary: 'Consulta el resumen y las herramientas operativas de este proyecto.',
    calendar: 'Planifica actividades y consulta tu agenda sin necesitar una conexión externa.',
    bookings: 'Revisa los pedidos o reservas registrados para este proyecto.',
    automation: 'Configura los mensajes y las opciones de contacto disponibles para tu negocio.',
  };
  const rememberTool = (task: { id: string; tool?: string }) => { if (knownTaskTool(task.tool)) remember({ projectId, area, taskId: task.id, tool: task.tool }); };
  const updateWorld = (value: Partial<typeof state>) => change({ world: { ...entry.world, areas: { ...entry.world.areas, [area]: { ...state, ...value } } } });
  return <section className="area-panel" style={{ '--area-color': meta.color } as React.CSSProperties}>
    <header className="area-intro"><div><small>{meta.pet} te acompaña</small>{showHeading&&<h2>{meta.title}</h2>}</div><span>{progress.total ? `${progress.completed} de ${progress.total} pasos` : 'A tu ritmo'}</span></header>

    {mode==='play'&&<DSButtonSecondary onClick={()=>setMode('work')}>← Volver a mis pasos</DSButtonSecondary>}
    {entry.historical && <small>Las barras ahora se calculan con tus tareas. Tus marcas anteriores se conservan.</small>}
    <fieldset disabled={entry.busy}>
    {mode === 'work' ? <>
      <div className="area-task-summary" aria-label="Resumen de pasos"><progress max={progress.total || 1} value={progress.completed} aria-label={`Pasos completados de ${meta.title}`} /><span>{progress.completed ? `${progress.completed} pasos que ya lograste` : 'Cada paso cuenta. Empecemos por uno.'}</span></div>
      {selectedTask && <section className="area-task-detail" aria-label="Proceso de la tarea">
        <button type="button" className="area-back-to-steps" onClick={()=>setSelectedTaskId(null)}>← Todos mis pasos</button>
        <small className="area-step-state">{selectedTask.done?'Completado':'Tu siguiente paso'}</small>
        <h3>{selectedTask.title}</h3>
        <p>{selectedTask.done?'Puedes volver a su herramienta cuando quieras.':'Abre tu espacio de trabajo. Al volver podrás marcar este paso como terminado.'}</p>
        {selectedTask.guidance&&<div className="area-step-guidance"><p>{selectedTask.guidance.description}</p><ol>{selectedTask.guidance.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>{selectedTask.guidance.estimatedMinutes!==null&&<small>Estimación: {selectedTask.guidance.estimatedMinutes} min</small>}</div>}
        {knownTaskTool(selectedTask.tool)?<Link className="area-task-start" onClick={()=>rememberTool(selectedTask)} to={taskWorkPath(projectId,selectedTask,type)!}>{taskTools.find(([key])=>key===selectedTask.tool)?.[1]||'Abrir mi espacio de trabajo'} <span aria-hidden="true">→</span></Link>:<p>Este paso se realiza fuera de la app. Puedes marcarlo cuando lo termines.</p>}
        <details className="area-step-options"><summary>Opciones de este paso</summary>
          <details className="task-edit-options"><summary>Cambiar el nombre</summary><DSInput label="Nombre del paso" value={selectedTask.title} maxLength={200} onChange={event=>change({tasks:{...entry.tasks,tasks:entry.tasks.tasks.map(task=>task.id===selectedTask.id?{...task,title:event.target.value}:task)}})}/></details>
          <details className="task-ai-options"><summary>Dividirlo en pasos más pequeños</summary><TaskSuggestion key={selectedTask.id} projectId={projectId} sourceId={selectedTask.id} title={selectedTask.title} disabled={entry.dirty||entry.busy||!entry.taskRevision||Boolean(entry.error)} onApply={(title,guidance)=>change({tasks:{...entry.tasks,tasks:entry.tasks.tasks.map(t=>t.id===selectedTask.id?{...t,title,guidance}:t)}})}/></details>
          <details className="task-edit-options"><summary>Cambiar herramienta</summary><label className="task-tool-select">Herramienta del paso<select value={knownTaskTool(selectedTask.tool)?selectedTask.tool:''} onChange={event=>change({tasks:{...entry.tasks,tasks:entry.tasks.tasks.map(task=>task.id===selectedTask.id?{...task,tool:event.target.value||undefined}:task)}})}><option value="">Paso fuera de la app</option>{taskTools.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></details>
          <DSButtonSecondary disabled={!focus.loaded||focus.busy||entry.dirty||entry.taskRevision===null||(!focus.data.today.some(ref=>sameTask(ref,{projectId,taskId:selectedTask.id}))&&focus.data.today.length>=3)} onClick={()=>toggle({projectId,taskId:selectedTask.id})}>{focus.data.today.some(ref=>sameTask(ref,{projectId,taskId:selectedTask.id}))?'Quitar de Hoy':'Elegir para Hoy'}</DSButtonSecondary>
          {(entry.dirty||entry.taskRevision===null)&&<small>Guarda los cambios antes de elegir este paso para Hoy.</small>}
          {focus.dirty&&<DSButtonSecondary disabled={focus.busy} onClick={()=>void saveFocus()}>Guardar enfoque</DSButtonSecondary>}
          <DSButtonSecondary onClick={()=>setDeleteTask(selectedTask.id)}>Quitar este paso</DSButtonSecondary>
        </details>
      </section>}
      {!selectedTask&&<section className="area-next-card"><span className="area-next-icon" aria-hidden="true">{area==='marketing'?'✦':area==='finance'?'◈':area==='logistics'?'⌁':'⚙'}</span><small>PODEMOS EMPEZAR AQUÍ</small><h3>{nextTask?.title||'Ya completaste estos pasos'}</h3><p>{nextTask?(nextPath?(area==='marketing'&&nextTask.tool==='studio'?'Elige qué quieres contar y prepara una publicación con la información de tu negocio.':'Abre la herramienta de este paso y continúa donde lo dejaste.'):'Este paso lo haces por tu cuenta. Puedes revisar sus detalles.'):'Puedes revisar lo que lograste o añadir un nuevo paso.'}</p>{nextTask&&(nextPath?<Link className="area-task-start" to={nextPath} onClick={()=>rememberTool(nextTask)}>{area==='marketing'&&nextTask.tool==='studio'?'Crear mi contenido':'Empezar este paso'} <span aria-hidden="true">→</span></Link>:<DSButtonSecondary onClick={()=>setSelectedTaskId(nextTask.id)}>Ver este paso →</DSButtonSecondary>)}</section>}
      {!selectedTask&&<details className="area-all-steps"><summary>Ver y organizar mis {tasks.length} pasos</summary><ul className="area-task-list">{visibleTasks.map(task => <li key={task.id}><DSInput type="checkbox" aria-label={`Completar ${task.title}`} checked={task.done} onChange={() => change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.map(t => t.id === task.id ? { ...t, done: !t.done, firstCompletedAt: t.firstCompletedAt ?? t.completedAt ?? (!t.done ? new Date().toISOString() : undefined), completedAt: !t.done ? new Date().toISOString() : undefined } : t) }, world: !task.done ? rewardTask(entry.world, area) : entry.world })} /><DSButtonSecondary type="button" className="area-task-open" aria-expanded={selectedTaskId === task.id} tooltip="Consulta el estado de este paso y abre su herramienta." onClick={() => {const path=taskWorkPath(projectId,task,type);if(path){rememberTool(task);navigate(path);}else setSelectedTaskId(task.id);}}>{task.title}<small>{task.done ? '✓ Completada' : 'Pendiente'}</small></DSButtonSecondary><DSButtonSecondary aria-label={`Opciones de ${task.title}`} onClick={()=>setSelectedTaskId(task.id)}>•••</DSButtonSecondary></li>)}</ul></details>}
      <div>{deleteTask && <section className="recovery-notice"><p>¿Quitar esta tarea? Se eliminará al guardar.</p><DSButtonSecondary onClick={() => { change({tasks:{...entry.tasks,tasks:entry.tasks.tasks.filter(t=>t.id!==deleteTask)}}); setDeleteTask(null); }}>Quitar tarea</DSButtonSecondary><DSButtonSecondary onClick={()=>setDeleteTask(null)}>Conservar tarea</DSButtonSecondary></section>}</div><div className="area-tabs">{!selectedTask&&tasks.length > 3 && <DSButtonSecondary onClick={() => setShowAll(value => !value)}>{showAll ? 'Ver tres próximos pasos' : `Ver todas las tareas (${tasks.length})`}</DSButtonSecondary>}</div>{!selectedTask&&<details className="area-add-options"><summary>＋ Añadir otra tarea</summary><form className="area-add" onSubmit={event => { event.preventDefault(); if (!title.trim()) return; change({ tasks: { ...entry.tasks, tasks: [...entry.tasks.tasks, { id: randomId(), area, title: title.trim(), tool: tool || undefined, done: false, createdAt: new Date().toISOString() }] } }); setTitle(''); setTool(''); }}><DSInput aria-label="Nueva tarea" placeholder="Un paso pequeño…" value={title} maxLength={200} onChange={event => setTitle(event.target.value)} /><label className="task-tool-select">Herramienta (opcional)<select value={tool} onChange={event => setTool(event.target.value)}><option value="">Paso fuera de la app</option>{taskTools.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><DSButtonSecondary>Añadir</DSButtonSecondary></form></details>}
      {!selectedTask&&<details className="area-tool-options"><summary>Explorar herramientas de {meta.title}</summary><div className="area-tools">{area === 'marketing' && <>
        <Tooltip text="Crea o revisa tu página con una guía de cinco pasos."><Link to={`/dashboard/tools/landing?project=${projectId}&wizard=1`}>✨ Crear landing paso a paso →</Link></Tooltip>
        <Tooltip text="Abre tu borrador para editar textos, agregar bloques de tu rubro y arrastrar secciones."><Link to={`/dashboard/tools/landing?project=${projectId}`}>Editar mi página →</Link></Tooltip>
      </>}{tools[area].map(([label, tool]) => <Tooltip key={label} text={toolHelp[tool]}><Link to={tool.includes('&') ? `/dashboard/tools/landing?project=${projectId}&page=templates` : areaToolPath(tool, type, projectId)}>{label} →</Link></Tooltip>)}</div></details>}
    </> : <>
      <div className={`pet-playground decoration-${state.decoration}`}><span className="pet-decoration">{['🌿', '🌸', '⭐'][state.decoration]}</span><div style={{color:meta.color}} key={reactionId} className={`pet-friend ${reaction ? 'pet-react' : ''}`} aria-label={`Mascota ${meta.pet}`}><span className="pet-ears">● ●</span><span className="pet-face">● ᴗ ●</span><span>{meta.accessory}</span></div><p role="status">{reaction || 'Aquí puedes jugar sin terminar ninguna tarea.'}</p></div>
      <div className="area-tabs"><DSButtonSecondary onClick={() => reactTo('¡Qué gusto verte! ♡')}>Acariciar</DSButtonSecondary><DSButtonSecondary onClick={() => reactTo('¡Ñam! Gracias por compartir un snack conmigo.')}>Dar un snack</DSButtonSecondary></div>
      <h3>Busca tres tesoros</h3><p>Sin prisa. Encuentra la concha, la flor y la estrella.</p><div className="pet-search" aria-label="Escena de búsqueda"><span aria-hidden="true">🌳 🪨 🌱 🌊</span>{['🐚', '🌼', '⭐'].map((item, index) => <DSButtonSecondary key={item} className={`treasure treasure-${index}`} disabled={found.includes(index)} aria-label={`Encontrar ${['concha', 'flor', 'estrella'][index]}`} onClick={() => { const next = [...found, index]; setFound(next); if (next.length === 3) { updateWorld({ searchReward: true }); reactTo('¡Encontraste los tres! Ya puedes elegir las flores para decorar.'); } }}>{found.includes(index) ? '✓' : item}</DSButtonSecondary>)}</div>{found.length === 3 && <DSButtonSecondary onClick={() => setFound([])}>Volver a jugar</DSButtonSecondary>}
      <h3>Tu rincón</h3><div className="area-tabs">{['Planta', 'Flores', 'Estrella'].map((label, index) => <DSButtonSecondary key={label} aria-pressed={state.decoration === index} disabled={index === 1 ? !state.searchReward : index === 2 ? !state.taskReward : false} onClick={() => updateWorld({ decoration: index })}>{label}{index === 1 && !state.searchReward ? ' · encuentra tesoros' : index === 2 && !state.taskReward ? ' · completa una tarea' : ''}</DSButtonSecondary>)}</div>
    </>}
    </fieldset>
    {!selectedTask&&mode==='work'&&<button type="button" className="area-rest-link" onClick={()=>setMode('play')}>Tomar un descanso con {meta.pet}</button>}
    <AreaSaveStatus projectId={projectId} type={type} />
  </section>;
}
