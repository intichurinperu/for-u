import {projectStartPath} from '../../workspace/navigation';
import '../../toolkit/professionalEditor.css';
import './workspaceHome.css';
import {useState} from 'react';
import { Link } from 'react-router-dom';
import { ButtonSecondary as Button } from '../../components/ui/DesignSystem';
import {useActiveProjectsStore,type ForUActiveProject} from '../../stores/useActiveProjectsStore';
import { moduleLabels, projectModuleType } from '../../modules/moduleProjects';
import { areaDefinitions } from './areaModel';
import { useAreaDocuments } from './AreaDocuments';
import { useWorkspaceFocus } from './WorkspaceFocus';
import { projectDestination, taskDestination, resumePath, sameTask, type TaskReference } from './workspaceFocusModel';

export function FocusStatus() {
  const { state, save, reload } = useWorkspaceFocus();
  // Don't show aggressive pink alert boxes unless the user explicitly requested a sync action
  if (!state.dirty && !state.busy) return null;
  if (state.busy) return null;
  return <details className="focus-status-compact"><summary>{state.error?'Un cambio de enfoque necesita revisión':'Tu enfoque tiene cambios pendientes'}</summary><div role={state.error ? 'alert' : 'status'}>
    <span>{state.error || (state.busy ? 'Guardando enfoque…' : state.dirty ? 'Tu enfoque tiene cambios sin guardar.' : state.revision ? 'Enfoque guardado en tu cuenta.' : 'Elige hasta tres pasos para Hoy.')}</span>
    {state.loaded && state.dirty && <Button disabled={state.busy||state.conflict} onClick={() => void save()}>Guardar enfoque</Button>}
    {state.error && <Button disabled={state.busy} onClick={() => { if (!state.dirty || window.confirm('Recargar recuperará el enfoque guardado y descartará estos cambios de enfoque. ¿Continuar?')) void reload(true); }}>Recargar enfoque</Button>}
  </div></details>;
}

export default function WorkspaceHome({ projects }: { projects: ForUActiveProject[] }) {
  const { state } = useWorkspaceFocus();
  const [all,setAll]=useState(false),[search,setSearch]=useState('');
  const activeProject=useActiveProjectsStore(store=>store.activeProjectId);
  const recent=[...projects].sort((a,b)=>Number(b.id===activeProject)-Number(a.id===activeProject)||(Date.parse(b.updatedAt||b.createdAt)-Date.parse(a.updatedAt||a.createdAt)||0));
  const visible=recent.filter(p=>p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <div className="foru-home">
    <section className="workspace-projects" aria-label="Lista de proyectos">{all&&<input className="home-project-search" aria-label="Buscar entre mis proyectos" placeholder="Busca tu proyecto…" value={search} onChange={e=>setSearch(e.target.value)}/>}<div className="workspace-project-grid">{(all?visible:visible.slice(0,3)).map(project => <ProjectCard key={project.id} project={project} />)}</div>{projects.length>3&&<Button className="home-see-all" onClick={()=>{setAll(!all);setSearch('');}}>{all?'Mostrar menos':`Ver mis ${projects.length} proyectos`}</Button>}{all&&!visible.length&&<p>No encontramos un proyecto con ese nombre.</p>}</section>
    <details className="workspace-today home-today-fold"><summary><span>Mis prioridades de hoy</span><span>{state.data.today.length}/3 <span aria-hidden="true">⌄</span></span></summary><div className="home-today-content">

      <p className="home-today-help">Hasta tres pasos que tú eliges. Lo demás puede esperar.</p>
      {!state.loaded ? <p role="status">{state.error ? 'Tu enfoque no está disponible. Puedes continuar con tus proyectos.' : 'Cargando tu enfoque…'}</p> : <>
        {!state.data.today.length && <p className="focus-empty">Aún no elegiste pasos. Puedes seleccionarlos aquí o desde un área.</p>}
        <ul className="focus-list">{state.data.today.map(ref => {
          const project = projects.find(p => p.id === ref.projectId);
          return project ? <TodayTask key={`${ref.projectId}:${ref.taskId}`} reference={ref} project={project} /> : <UnavailableTask key={`${ref.projectId}:${ref.taskId}`} reference={ref} />;
        })}</ul>
        <details className="focus-picker"><summary>Elegir mis pasos de Hoy</summary>{projects.map(project => <ProjectTaskPicker key={project.id} project={project} />)}</details>
      </>}
    </div></details>

  </div>;
}
function ProjectCard({ project }: { project: ForUActiveProject }) {
  const type = projectModuleType(project)!;
  const { entry } = useAreaDocuments(project.id, type);
  const saved = entry?.loaded && entry.taskRevision !== null;
  const services=project.strategyProfile?.businessRoute==='services';
  const icon=services?'✦':{restaurant:'☕',ecommerce:'◈',tourism:'⌁',hospitality:'⌂',courses:'✎'}[type];
  return <article className={`workspace-project-card home-project-${type}`}><div className="home-project-heading"><span className="home-project-symbol" aria-hidden="true">{icon}</span><small>{services?'Servicios y ofertas mixtas':moduleLabels[type]}</small></div><h3>{project.name}</h3><p>{entry?.error ? 'Tu progreso no se pudo consultar.' : saved ? `${entry.tasks.tasks.filter(t => t.done).length} de ${entry.tasks.tasks.length} pasos${entry.dirty ? ' · cambios pendientes' : ''}` : entry?.loaded ? 'Un espacio por descubrir' : 'Cargando tu avance…'}</p><nav aria-label={`Acciones de ${project.name}`}><Link className="home-project-open" to={projectStartPath(project.id)}>Abrir proyecto <span aria-hidden="true">→</span></Link></nav></article>;
}
function UnavailableTask({ reference, title = 'Este paso ya no está disponible o pertenece a un proyecto que no se pudo cargar.' }: { reference: TaskReference; title?: string }) {
  const { state, toggle } = useWorkspaceFocus();
  return <li><span>{title}</span><Button disabled={state.busy} onClick={() => toggle(reference)}>Quitar de Hoy</Button></li>;
}
function TodayTask({ reference, project }: { reference: TaskReference; project: ForUActiveProject }) {
  const type = projectModuleType(project)!;
  const { entry, reload } = useAreaDocuments(project.id, type);
  const { state, toggle, remember } = useWorkspaceFocus();
  if (!entry?.loaded || entry.error) return <li><span>{project.name} · {entry?.error ? 'No se pudo cargar este paso.' : 'Cargando paso…'}</span>{entry?.error && <Button onClick={() => { if (!entry.dirty || window.confirm('Recargar descartará los cambios de tareas sin guardar. ¿Continuar?')) void reload(); }}>Reintentar</Button>}</li>;
  const task = entry.tasks.tasks.find(t => t.id === reference.taskId);
  if (!task) return <UnavailableTask reference={reference} title={`${project.name} · Este paso ya no está en la lista.`} />;
  const work = taskDestination(project.id, task);
  return <li><div><small>{project.name} · {areaDefinitions.find(a => a.id === task.area)?.title}</small><Link className="home-next-step" to={resumePath(work, type)} onClick={() => remember(work)}><span>{task.title}</span><span aria-hidden="true">→</span></Link><span>{task.done ? '✓ Completado' : 'Pendiente'}{entry.dirty ? ' · cambios sin guardar' : ''}</span></div><Button disabled={state.busy} onClick={() => toggle(reference)} aria-label={`Quitar ${task.title} de Hoy`}>×</Button></li>;
}
function ProjectTaskPicker({ project }: { project: ForUActiveProject }) {
  const { entry } = useAreaDocuments(project.id, projectModuleType(project)!);
  const { state, toggle } = useWorkspaceFocus();
  const canSelect = entry?.loaded && entry.taskRevision !== null && !entry.dirty && !entry.busy && !entry.error;
  return <details><summary>{project.name}</summary>{!canSelect ? <p>Guarda o recupera las tareas en <Link className="home-recovery-link" to={`/dashboard?project=${project.id}`}>Abrir el mapa del proyecto →</Link> antes de elegirlas.</p> : <ul>{entry.tasks.tasks.filter(task => !task.done || state.data.today.some(ref => sameTask(ref, { projectId: project.id, taskId: task.id }))).map(task => {
    const ref = { projectId: project.id, taskId: task.id };
    const selected = state.data.today.some(other => sameTask(ref, other));
    return <li key={task.id}><label><input type="checkbox" checked={selected} disabled={state.busy || (!selected && state.data.today.length >= 3)} onChange={() => toggle(ref)} />{task.title}</label></li>;
  })}</ul>}</details>;
}
