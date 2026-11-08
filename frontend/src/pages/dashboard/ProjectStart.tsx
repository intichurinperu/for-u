import { useEffect, useRef, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PearlButton from '../../components/ui/PearlButton';
import { useAuth } from '../../contexts/AuthContext';
import { projectRouteType } from '../../experience/GuidedProject';
import { missingRouteAnswers } from '../../experience/initialJourney';
import { emptyJourney, parseJourney } from '../../experience/journeyModel';
import { canonicalAnswer } from '../../experience/routePreparation';
import { usePrivateDocument } from '../../experience/usePrivateDocument';
import { useUnsavedNavigation } from '../../lib/useUnsavedNavigation';
import type { ModuleType } from '../../modules/moduleProjects';
import { emptyProposal, parseProposal } from '../../proposal/model';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { emptyDiagnostic, emptyProjectRoute, parseDiagnostic, parseProjectRoute } from '../../workspace/contracts';
import { useAreaDocuments } from './AreaDocuments';
import { updateTaskState, type AreaTask } from './areaModel';
import { routeTaskWorkPath } from './workspaceFocusModel';
import './projectStart.css';

export default function ProjectStart({ projectId, type }: { projectId: string; type: ModuleType }) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const project = useActiveProjectsStore(state => state.projectsById[projectId]);
  const userId = user!.id;
  const businessRoute = projectRouteType(project);
  const route = usePrivateDocument(userId, projectId, 'project-route', () => emptyProjectRoute(projectId), value => parseProjectRoute(value, projectId));
  const diagnostic = usePrivateDocument(userId, projectId, 'project-diagnostic', () => emptyDiagnostic(projectId, businessRoute), value => parseDiagnostic(value, projectId));
  const proposal = usePrivateDocument(userId, projectId, 'proposal', emptyProposal, parseProposal);
  const history = usePrivateDocument(userId, projectId, 'project-journey', emptyJourney, parseJourney);
  const { entry, reload, change, save } = useAreaDocuments(projectId, type);
  const [completion, setCompletion] = useState<{id: string; state: 'saving' | 'failed'} | null>(null);
  const [toolsOpen,setToolsOpen] = useState(false);
  const completionLock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const query = new URLSearchParams({ project: projectId });
  const setup = `/dashboard?${query}&setup=1`;
  const ready = !!route.revision && !!entry?.loaded;
  useUnsavedNavigation(!!completion && (completion.state === 'saving' || !!entry?.dirty));
  useEffect(() => { if (ready) heading.current?.focus({ preventScroll: true }); }, [ready]);

  if (route.error || (entry?.error && !completion)) return <section className="project-start" role="alert">
    <h2>No pudimos abrir tu ruta</h2>
    <PearlButton compact onClick={() => { void route.reload(); void reload(); }}>Reintentar</PearlButton>
  </section>;
  if (!route.loaded || !entry?.loaded) return <section className="project-start" aria-busy="true"><p role="status">Abriendo tu ruta…</p></section>;

  const byId = new Map(entry.tasks.tasks.map(task => [task.id, task]));
  const steps = route.data.taskIds.flatMap(id => {
    const task = byId.get(id);
    return task ? [task] : [];
  });
  const next = steps.find(task => !task.done || task.id === completion?.id);
  const destination = next && routeTaskWorkPath(projectId, next, type);
  const returningToStep = !!next && params.get('task') === next.id;
  const completionConflict = entry.taskStatus === 'conflict' || entry.worldStatus === 'conflict';

  async function completeStep(task: AreaTask) {
    if (!entry?.loaded || entry.busy || completionLock.current || completionConflict) return;
    completionLock.current = true;
    setCompletion({ id: task.id, state: 'saving' });
    try {
      if (!task.done) {
        const finished = updateTaskState(task, 'done');
        finished.firstCompletedAt ??= finished.completedAt;
        change({ tasks: { ...entry.tasks, tasks: entry.tasks.tasks.map(item => item.id === task.id ? finished : item) } });
      }
      setCompletion(await save() ? null : { id: task.id, state: 'failed' });
    } catch {
      setCompletion({ id: task.id, state: 'failed' });
    } finally {
      completionLock.current = false;
    }
  }
  const answers = diagnostic.data.version === 2 ? {
    ...diagnostic.data.answers,
    offering: canonicalAnswer(diagnostic.data, proposal.data, 'offering') ?? '',
    audience: canonicalAnswer(diagnostic.data, proposal.data, 'audience') ?? '',
  } : {};
  const answeredByAudio = new Set((history.data.files || []).flatMap(file => file.question ? [file.question] : []));
  const missing = ready && diagnostic.loaded && !diagnostic.error && proposal.loaded && !proposal.error && history.loaded && !history.error
    ? missingRouteAnswers(answers, answeredByAudio)
    : [];
  const map = `/dashboard?${query}&view=map`;

  return <section className="project-start" aria-labelledby="project-next-step">
    <div className="project-start-route" aria-hidden="true"><span>⌁</span><i/><span>✦</span><i/><span>⚑</span></div>
    <h2 id="project-next-step" ref={heading} tabIndex={-1}>{ready ? 'Tu ruta digital está lista' : 'Traza tu ruta digital'}</h2>
    {!ready ? <>
      <p className="project-start-help">Cuéntanos qué haces y qué quieres lograr. Te proponemos por dónde empezar.</p>
      <PearlButton to={setup}>Preparar mi ruta</PearlButton>
    </> : <>
      {next ? <div className="project-start-feature">
        <small>TU SIGUIENTE PASO</small>
        <h3>{next.title}</h3>
        {route.data.reasons[next.id] && <p>{route.data.reasons[next.id]}</p>}
        {completion?.state === 'saving' ? <p role="status">Guardando tu progreso…</p> : <>
          {returningToStep || completion?.state === 'failed' ? <>
            <PearlButton to={destination || map}>Continuar este paso</PearlButton>
            <PearlButton compact tone="neutral" disabled={entry.busy || completionConflict} onClick={() => void completeStep(next)}>
              {completion?.state === 'failed' ? 'Reintentar guardado' : 'Marcar como hecho'}
            </PearlButton>
          </> : <PearlButton to={destination || map}>Empezar este paso</PearlButton>}
          {completion?.state === 'failed' && <p role="alert">{completionConflict
            ? 'El paso cambió en otra ventana. Revisa la versión guardada en Kanban.'
            : 'Tu progreso quedó pendiente. Vuelve a intentar el guardado.'}</p>}
        </>}
      </div> : <p className="project-start-help">{steps.length ? 'Ya completaste los pasos de esta ruta.' : 'Tu isla reúne las áreas de tu proyecto.'}</p>}
      {steps.length > 0 && <ol className="project-start-steps" aria-label="Pasos de mi ruta">
        {steps.map((step, index) => {
          const current = step.id === next?.id;
          const done = step.done && !current;
          return <li key={step.id} className={current ? 'is-current' : done ? 'is-done' : ''} aria-current={current ? 'step' : undefined}>
            <span className="project-start-number" aria-hidden="true">{done ? '✓' : index + 1}</span>
            <div><strong>{step.title}</strong><small>{current ? 'Empieza aquí' : done ? 'Completado' : 'Después'}</small></div>
          </li>;
        })}
      </ol>}
      {missing.length > 0 && <section className="project-start-missing" aria-label="Respuestas pendientes">
        <h3>Puedes completar esto más adelante</h3>
        <div className="project-start-links">{missing.map(item => <PearlButton key={item.key} compact tone="neutral" to={`${setup}&question=${item.key}&return=route`}>{item.label}</PearlButton>)}</div>
      </section>}
    </>}
    <footer className="project-start-footer">
      <PearlButton compact tone="neutral" to={map}>Ver mi isla</PearlButton>
      <PearlButton compact tone="neutral" aria-expanded={toolsOpen} aria-controls="project-start-tools" onClick={()=>setToolsOpen(!toolsOpen)}><span className="project-start-tool-label"><FolderOpen size={16} aria-hidden="true"/>Más herramientas</span></PearlButton>
    </footer>
    <nav id="project-start-tools" className="project-start-tool-list" aria-label="Más herramientas" hidden={!toolsOpen}>
      <PearlButton compact tone="neutral" to={`/dashboard/tools/landing?${query}`}>Diseñar mi página</PearlButton>
      <PearlButton compact tone="neutral" to={`/creator-studio?${query}&tab=create`}>Creator Studio</PearlButton>
      <PearlButton compact tone="neutral" to={`/dashboard/tools/video?${query}`}>Editor de video</PearlButton>
      {ready && <PearlButton compact tone="neutral" to={`${setup}&step=answers`}>Ajustar mis respuestas</PearlButton>}
    </nav>
  </section>;
}
