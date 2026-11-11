import {EditorStageContext} from './EditorStage';
import PresentationReview from '../presentation/PresentationReview';
import RestaurantMenu from './restaurant/RestaurantMenu';
import type {RestaurantData} from './restaurant/model';
import {presentationClass,type PresentationVersion} from '../presentation/model';
import { ButtonPrimary as DSButtonPrimary, ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProjectSelector from '../components/shared/ProjectSelector';
import { loadModuleDocument, loadModuleProjects, saveModuleDocument } from '../services/moduleDocuments';
import { moduleLabels, projectModuleType, type ModuleProject, type ModuleType } from './moduleProjects';
import type { ComponentType } from 'react';
import './moduleWorkspace.css';
import { ModuleDraftContext } from './useModuleDraft';
import { MediaScope } from '../components/shared/mediaScope';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { useUnsavedNavigation } from '../lib/useUnsavedNavigation';
export type ModuleConfiguration<T> = {
  type: ModuleType;
  create: (name: string) => T;
  parse: (value: unknown) => T;
  Dashboard: ComponentType<{ data: T; onChange: (data: T) => void; project?: ModuleProject; userId?: string }>;
  Editor: ComponentType<{ data: T; onChange: (data: T) => void; project?: ModuleProject; userId?: string }>;
  dashboardLabel: string;
  editorLabel: string;
  Publication?: ComponentType<{ data: T; userId: string; project: ModuleProject; disabled: boolean }>;
};

export default function ModuleWorkspace<T>({ config }: { config: ModuleConfiguration<T> }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [params] = useSearchParams();
  const projectId = params.get('project');
  const [projects, setProjects] = useState<ModuleProject[]>([]);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [loadedFor, setLoadedFor] = useState('');
  const projectsById = useActiveProjectsStore(state => state.projectsById);
  const cloudUserId = useActiveProjectsStore(state => state.cloudUserId);
  const localModuleProjects = (cloudUserId === userId ? Object.values(projectsById) : []).flatMap(project => (
    !project.cloudPending && projectModuleType(project) === config.type ? [{ id: project.id, name: project.name, type: config.type }] : []
  ));
  const loadKey = `${userId ?? ''}:${config.type}:${attempt}`;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadModuleProjects(userId).then(value => { if (active) { setProjects(value.filter(project => project.type === config.type)); setError(''); setLoadedFor(loadKey); } })
      .catch(reason => { if (active) { setError(reason.message); setLoadedFor(loadKey); } });
    return () => { active = false; };
  }, [userId, loadKey, config.type]);
  if (loadedFor !== loadKey || !user) return <main className={`${config.type}-module module-workspace`}><p role="status">Cargando tus proyectos…</p></main>;
  const availableProjects = [...projects, ...localModuleProjects.filter(local => !projects.some(project => project.id === local.id))];
  if (error && availableProjects.length === 0) return <main className={`${config.type}-module module-workspace`}><p role="alert">{error}</p><DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar</DSButtonSecondary><Link to="/dashboard">Volver a mis proyectos</Link></main>;
  const current = projectId ? availableProjects.find(project => project.id === projectId) : availableProjects[0];
  if (!current) return <main className={`${config.type}-module module-workspace`}><h1>{projectId ? 'Proyecto no disponible' : 'Tu proyecto empieza aquí'}</h1><p>{projectId ? 'Elige un proyecto de este rubro para continuar.' : 'Crea un proyecto de este rubro desde tu tablero.'}</p><Link to="/dashboard">Ir a mis proyectos</Link></main>;
  return <ModuleSession config={config} key={`${user.id}:${current.id}`} userId={user.id} project={current} projects={availableProjects} />;
}

function ModuleSession<T>({ userId, project, projects, config }: { userId: string; project: ModuleProject; projects: ModuleProject[]; config: ModuleConfiguration<T> }) {
  const { Dashboard, Editor, Publication } = config;
  const navigate = useNavigate();
  const location = useLocation();
  const editing = location.pathname.endsWith('/editor');
  const [data, setData] = useState<T | null>(null);
  const [stage,setStage]=useState(1);
  const [revision, setRevision] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  useUnsavedNavigation(dirty || pendingDraft);
  useEffect(() => {
    let active = true;
    loadModuleDocument(userId, project.id, config.type).then(document => {
      if (!active) return;
      const payload = document ? config.parse(document.payload) : config.create(project.name);
      setStage(config.type==='restaurant'&&(payload as {dishes?:unknown[]}).dishes?.length?2:1);
      setData(payload); setRevision(document?.revision ?? null); setDirty(false); setStatus('');
    }).catch(reason => { if (active) setStatus(reason.message); });
    return () => { active = false; };
  }, [userId, project.id, project.name, attempt, config]);
  useEffect(() => {
    if (!dirty && !pendingDraft) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty, pendingDraft]);
  function update(value: T) { setData(value); setDirty(true); setStatus('Tienes cambios sin guardar.'); }
  async function save() {
    if (!data || busy.current || pendingDraft) return;
    busy.current = true; setSaving(true);
    try {
      const nextRevision = await saveModuleDocument(userId, project.id, config.type, data, revision);
      setRevision(nextRevision); setDirty(false); setStatus('Guardado en tu cuenta.');
    } catch (reason) { setStatus((reason as Error).message); }
    finally { busy.current = false; setSaving(false); }
  }
  function leave(path: string) {
    if ((dirty || pendingDraft) && !window.confirm('Hay cambios sin guardar. ¿Quieres salir y descartarlos?')) return;
    navigate(path);
  }
  function changeView(path: string) {
    if (saving) return;
    if (pendingDraft && !window.confirm('Hay un formulario sin aplicar. ¿Quieres descartarlo y cambiar de vista?')) return;
    navigate(path);
  }
  if (!data) return <main className={`${config.type}-module module-workspace`}><p role="status">{status || 'Cargando el proyecto…'}</p>{status && <DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar carga</DSButtonSecondary>}</main>;
  return <main className={`${config.type}-module module-workspace`}>
    {location.state?.notice && <p role="alert">{location.state.notice}</p>}
    <header className="module-header"><div><span>For U · {moduleLabels[config.type]}</span><h1>{project.name}</h1></div><DSButtonPrimary disabled={!dirty || saving || pendingDraft} onClick={save}>{saving ? 'Guardando…' : 'Guardar cambios'}</DSButtonPrimary></header>
    <p role="status">{status}</p>
    <DSButtonSecondary disabled={saving} onClick={() => { if ((!dirty && !pendingDraft) || window.confirm('Actualizar recupera los datos guardados y descarta los cambios pendientes. ¿Continuar?')) { setData(null); setAttempt(value => value + 1); } }}>Actualizar datos</DSButtonSecondary>
    {pendingDraft && <p role="status">Termina y aplica el formulario abierto, o cancélalo, antes de guardar el proyecto.</p>}
    <details className="module-more-actions"><summary>Más herramientas del proyecto</summary><DSButtonSecondary disabled={saving} onClick={() => leave(`/content-creator?project=${encodeURIComponent(project.id)}`)}>Crear contenido</DSButtonSecondary>
    {config.type === 'restaurant' && <DSButtonSecondary onClick={() => leave(`/modules/restaurant/orders?project=${encodeURIComponent(project.id)}`)}>Pedidos internos · mesas y delivery</DSButtonSecondary>}
    </details><nav className="module-navigation" aria-label={moduleLabels[config.type]}><DSButtonSecondary disabled={saving} onClick={() => leave('/dashboard?view=projects')}>Mis proyectos</DSButtonSecondary><DSButtonSecondary disabled={saving} aria-current={editing ? undefined : 'page'} onClick={() => changeView(`/modules/${config.type}?project=${encodeURIComponent(project.id)}`)}>{config.dashboardLabel}</DSButtonSecondary><DSButtonSecondary disabled={saving} aria-current={editing ? 'page' : undefined} onClick={() => changeView(`/modules/${config.type}/editor?project=${encodeURIComponent(project.id)}`)}>{config.editorLabel}</DSButtonSecondary></nav>
    <fieldset className="module-editing-area" disabled={saving}>
      <ModuleDraftContext.Provider value={setPendingDraft}>
      <MediaScope.Provider value={{ userId, projectId: project.id }}>
      <EditorStageContext.Provider value={{stage,setStage}}>{editing ? <Editor data={data} onChange={update} project={project} userId={userId} /> : <Dashboard data={data} onChange={update} project={project} userId={userId} />}</EditorStageContext.Provider>
      </MediaScope.Provider>
      </ModuleDraftContext.Provider>
    </fieldset>
    {config.type === 'restaurant' && (!editing||stage===3) && <div className="restaurant-save-step"><DSButtonPrimary disabled={!dirty || saving || pendingDraft} onClick={save}>{saving ? 'Guardando…' : '2. Guardar mi menú'}</DSButtonPrimary><p>{pendingDraft ? 'Aplica o cancela el formulario abierto antes de guardar y publicar.' : dirty ? 'Guarda antes de publicar para conservar tus productos.' : 'Tus cambios están guardados. Puedes publicar el menú.'}</p></div>}
    {Publication&&(!editing||config.type!=='restaurant'||stage===3)&&<PresentationReview value={(data as {presentationVersion?:PresentationVersion}).presentationVersion} disabled={saving||pendingDraft} onChange={presentationVersion=>update({...data,presentationVersion})} render={presentationVersion=>config.type==='restaurant'?<RestaurantMenu key={presentationVersion} data={{...data as RestaurantData,presentationVersion}}/>:<div className={presentationClass(presentationVersion)}><h2>{project.name}</h2>{((data as {tours?:{id:string;name:string;description:string;price:number}[]}).tours??[]).map(t=><article key={t.id}><h3>{t.name}</h3><p>{t.description}</p><strong>S/ {t.price.toFixed(2)}</strong></article>)}</div>}/>}
    {Publication && (!editing||config.type!=='restaurant'||stage===3) && <Publication data={data} userId={userId} project={project} disabled={dirty || pendingDraft || saving} />}
  </main>;
}
