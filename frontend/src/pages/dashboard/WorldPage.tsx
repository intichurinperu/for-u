import { probeWorldCanvas } from './worldLifecycle';
import { Input, ButtonSecondary } from '../../components/ui/DesignSystem';
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { useAuth } from '../../contexts/AuthContext';
import { useAreaDocuments, useAreaCache } from './AreaDocuments';
import { projectModuleType } from '../../modules/moduleProjects';
import { areaDefinitions, areaProgress, isSavedProject, type AreaId } from './areaModel';
import { useDialogFocus } from '../../toolkit/useDialogFocus';
import { confirmWorkspaceNavigation } from '../../lib/useUnsavedNavigation';
import AreaPanel from './AreaPanel';
import './worldExperience.css';
const WorldScene = lazy(() => import('./WorldScene'));
class SceneBoundary extends Component<{
    children: ReactNode;
    fallback: ReactNode;
    onFailure: () => void;
}, {
    failed: boolean;
}> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch() { this.props.onFailure(); }
    render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export default function WorldPage() {
    const { user } = useAuth();
    const store = useActiveProjectsStore();
    const [params, setParams] = useSearchParams();
    const cache = useAreaCache();
    const [area, setArea] = useState<AreaId | null>(null), [lite, setLite] = useState(false), [sceneError, setSceneError] = useState(false), [zoom, setZoom] = useState(34), [attempt, setAttempt] = useState(0), [sceneReady, setSceneReady] = useState(false);
    const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches), [visible, setVisible] = useState(!document.hidden);
    const [measure, setMeasure] = useState(0), [sample, setSample] = useState<string>('');
    useEffect(()=>{if(lite){setMeasure(0);setSample(value=>value.startsWith("Midiendo")?"Medición cancelada: activaste Vista ligera. Pulsa Medir para comenzar otra vez.":value);}},[lite]);
    const dialog = useRef<HTMLDivElement>(null);
    useDialogFocus(dialog, area !== null, () => setArea(null));
    useEffect(() => { const m = window.matchMedia('(prefers-reduced-motion: reduce)'); const change = () => setReduced(m.matches); m.addEventListener('change', change); return () => m.removeEventListener('change', change); }, []);
    useEffect(() => { const change = () => setVisible(!document.hidden); document.addEventListener('visibilitychange', change); return () => document.removeEventListener('visibilitychange', change); }, []);
    useEffect(() => { if (!area)
        return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [area]);
    useEffect(() => { setSceneReady(false); if (probeWorldCanvas())
        setSceneReady(true);
    else {
        setSceneError(true);
        setLite(true);
    } }, [attempt]);
    const projects = store.cloudUserId === user?.id ? Object.values(store.projectsById).filter(p => isSavedProject(p.id) && !p.cloudPending && projectModuleType(p)) : [];
    const requested = params.get('project');
    const project = requested ? projects.find(p => p.id === requested) : projects.find(p => p.id === store.activeProjectId) ?? projects[0];
    useEffect(() => { setArea(null); if (project && store.activeProjectId !== project.id)
        store.switchProject(project.id); }, [project?.id]);
    const failed = useCallback(() => { setSceneError(true); setLite(true); setSample('La escena no respondió. Medición no válida.'); }, []);
    const loadingProjects=store.isCloudSyncing||store.cloudUserId!==user?.id;
    const retryProjects=()=>{if(user)void store.hydrateFromSupabase(user.id);};
    if (!project) return <section className="world-intro" role={store.projectLoadError?'alert':loadingProjects?'status':undefined}><h1>{store.projectLoadError?'No pudimos cargar tus islas':loadingProjects?'Cargando tus islas…':requested?'Este proyecto no está disponible':'Tu mundo empieza con una isla'}</h1><p>{store.projectLoadError|| (loadingProjects?'Conservamos el contexto mientras consultamos tu cuenta.':requested?'No abriremos otra isla en su lugar.':'Cada proyecto guardado tendrá su propio lugar.')}</p>{store.projectLoadError&&<ButtonSecondary onClick={retryProjects}>Reintentar proyectos</ButtonSecondary>}<Link to="/dashboard">Mis proyectos</Link></section>;
    const select = (id: string) => { if (id === project.id)
        return; if (!confirmWorkspaceNavigation())
        return; store.switchProject(id); setParams({ project: id }); setArea(null); };
    const retryScene=()=>{setSceneError(false);setSceneReady(false);setLite(false);setAttempt(n=>n+1);};
    const fallback = <div className="world-lite"><span aria-hidden="true">⛵</span><h2>{project.name}</h2><p>{sceneError ? 'El 3D no está disponible. Tus tareas y juegos siguen aquí.' : 'Vista ligera: las mismas tareas, mascotas y juegos.'}</p>{sceneError && <ButtonSecondary onClick={retryScene}>Reintentar escena 3D</ButtonSecondary>}</div>;
    return <section className={`world-page ${reduced ? "has-reduced-motion" : ""}`}><header className="world-intro"><small>Tu espacio para avanzar y descansar</small><h1>Mi mundo</h1>{store.projectLoadError&&<div role="alert"><p>{store.projectLoadError} Mostramos la última consulta válida.</p><ButtonSecondary onClick={retryProjects}>Reintentar proyectos</ButtonSecondary></div>}<p>Elige una isla y un espacio. Un paso a tu ritmo.</p><div className="world-options"><label><Input type="checkbox" checked={lite} onChange={e => e.target.checked ? setLite(true) : retryScene()}/> Vista ligera</label><label><Input type="checkbox" checked={reduced} onChange={e => setReduced(e.target.checked)}/> Reducir movimiento</label></div></header><nav className="world-island-picker" aria-label="Viajar entre islas">{projects.map(p => <IslandButton key={p.id} id={p.id} name={p.name} type={projectModuleType(p)!} selected={p.id === project.id} onSelect={() => select(p.id)}/>)}</nav>
 {!lite && <div className="area-tabs"><ButtonSecondary aria-label="Alejar la isla" disabled={zoom <= 24} onClick={() => setZoom(v => Math.max(24, v - 5))}>− Alejar</ButtonSecondary><ButtonSecondary aria-label="Acercar la isla" disabled={zoom >= 49} onClick={() => setZoom(v => Math.min(49, v + 5))}>＋ Acercar</ButtonSecondary></div>}
 {lite ? fallback : !sceneReady ? <div className="world-lite" role="status">Comprobando escena…</div> : <SceneBoundary key={attempt} fallback={fallback} onFailure={failed}><Suspense fallback={<div className="world-lite" role="status">Preparando el mar…</div>}><WorldScene projects={projects} cache={cache} activeId={project.id} onSelect={select} onArea={setArea} reduced={reduced} visible={visible} onFailure={failed} zoom={zoom} measure={measure} onSample={setSample}/></Suspense></SceneBoundary>}
 <WorldAreas projectId={project.id} type={projectModuleType(project)!} area={area} onArea={setArea}/>
 {area && <div className="area-modal-backdrop"><div ref={dialog} className="area-modal-dialog world-area-dialog" role="dialog" aria-modal="true" aria-labelledby="world-area-title"><header className="area-modal-heading"><h2 id="world-area-title">{areaDefinitions.find(a => a.id === area)!.title} · {project.name}</h2><ButtonSecondary onClick={() => setArea(null)} aria-label="Cerrar espacio">Cerrar ×</ButtonSecondary></header><AreaPanel key={`${project.id}:${area}`} projectId={project.id} type={projectModuleType(project)!} area={area}/></div></div>}
 <details className="world-performance"><summary>Comprobar rendimiento de este dispositivo</summary><p>Mide 60 segundos: navega entre islas y abre espacios. Si ocultas la pestaña, la medición se cancela. No envía información al servidor.</p><ButtonSecondary disabled={lite || reduced || !visible} onClick={() => { setSample('Midiendo 60 segundos…'); setMeasure(n => n + 1); }}>Medir 60 segundos</ButtonSecondary><p role="status">{sample}</p><small>Anota modelo, sistema y navegador. Este resultado no representa otros móviles.</small></details>
 </section>;
}
function IslandButton({ id, name, type, selected, onSelect }: {
    id: string;
    name: string;
    type: NonNullable<ReturnType<typeof projectModuleType>>;
    selected: boolean;
    onSelect: () => void;
}) { const { entry } = useAreaDocuments(id, type); const button=useRef<HTMLButtonElement>(null);
    useEffect(()=>{const element=button.current,parent=element?.parentElement;if(selected&&element&&parent){parent.scrollLeft=element.offsetLeft-parent.offsetLeft-(parent.clientWidth-element.clientWidth)/2;}},[selected]);
    return <ButtonSecondary ref={button} aria-pressed={selected} onClick={onSelect}>🏝️ {name}<small>{entry?.loaded ? `${entry.tasks.tasks.filter(t => t.done).length}/${entry.tasks.tasks.length} pasos${entry.taskDirty ? ' · pendientes de guardar' : ''}` : entry?.error ? 'Error al cargar tareas' : 'Cargando tareas…'}</small></ButtonSecondary>; }
function WorldAreas({ projectId, type, area, onArea }: {
    projectId: string;
    type: NonNullable<ReturnType<typeof projectModuleType>>;
    area: AreaId | null;
    onArea: (area: AreaId) => void;
}) { const { entry } = useAreaDocuments(projectId, type); return <nav className="world-area-picker" aria-label="Espacios de la isla">{areaDefinitions.map(a => { const progress = areaProgress(entry?.tasks?.tasks ?? [], a.id), decor = entry?.world?.areas[a.id]?.decoration ?? 0; return <ButtonSecondary key={a.id} aria-pressed={area === a.id} style={{ borderColor: a.color }} onClick={() => onArea(a.id)}><span aria-hidden="true">{a.accessory} {['🌿', '🌸', '⭐'][decor]}</span><strong>{a.title}</strong><small>{a.pet} te espera</small><small>{entry?.loaded ? progress.total ? `${progress.completed}/${progress.total} tareas` : 'Sin tareas' : entry?.error ? 'Reintenta al abrir' : 'Cargando tareas…'}</small></ButtonSecondary>; })}</nav>; }
