import { useRef, useState } from 'react';
import { Compass, MapPin, Sparkles, Tags } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PearlButton from '../../components/ui/PearlButton';
import { useAuth } from '../../contexts/AuthContext';
import { projectRouteType } from '../../experience/GuidedProject';
import { initialQuestions } from '../../experience/initialJourney';
import { buildQuestions, list, meaningful, type Answers } from '../../experience/personalizationModel';
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
  const completionLock = useRef(false);
  const query = new URLSearchParams({ project: projectId });
  const setup = `/dashboard?${query}&setup=1`;
  useUnsavedNavigation(!!completion && (completion.state === 'saving' || !!entry?.dirty));

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
  const next = steps.find(task => task.id === (completion?.id ?? params.get('task')));
  const destination = next && routeTaskWorkPath(projectId, next, type);
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
  const answers: Answers = diagnostic.data.version === 2 ? {
    ...diagnostic.data.answers,
    offering: canonicalAnswer(diagnostic.data, proposal.data, 'offering') ?? '',
    audience: canonicalAnswer(diagnostic.data, proposal.data, 'audience') ?? '',
  } : {};
  const answeredByAudio = new Set((history.data.files || []).flatMap(file => file.question ? [file.question] : []));
  const questions = initialQuestions(buildQuestions(businessRoute, answers), answers);
  const answered = questions.filter(({ key, customKey }) => list(answers[key]).some(meaningful) ||
    list(answers[customKey || key + 'Custom']).some(meaningful) || answeredByAudio.has(key)).length;
  const hasRoute = Boolean(route.revision);
  const hasOffer = proposal.data.offers.length > 0 || proposal.data.nativeIds.length > 0;
  const answersReady = diagnostic.loaded && proposal.loaded && history.loaded &&
    !diagnostic.error && !proposal.error && !history.error;
  const island = `/dashboard?${query}&view=island`;
  const offers = `/dashboard/tools/proposal?${query}&section=offers`;
  const studio = `/creator-studio?${query}&tab=create`;
  const stages = [
    {
      title: 'Cuéntame sobre tu proyecto', icon: Compass,
      detail: answersReady ? `${answered} de ${questions.length} respuestas` : 'Tu historia y a quién quieres llegar',
      action: hasRoute ? 'Revisar mis respuestas' : answered ? 'Continuar preguntas' : 'Empezar preguntas',
      path: hasRoute ? `${setup}&step=answers` : setup,
    },
    {
      title: 'Define tu oferta y tus precios', icon: Tags,
      detail: hasOffer ? 'Tienes ofertas en tu propuesta' : 'Reúne lo que vendes y ponle precio',
      action: hasOffer ? 'Revisar mi oferta' : 'Definir oferta', path: offers,
    },
    {
      title: 'Cómo vender tu oferta', icon: Sparkles,
      detail: 'Tu página, publicaciones y videos',
      action: 'Abrir Creator Studio', path: studio,
    },
  ];
  const current = !hasRoute ? 0 : !hasOffer ? 1 : 2;

  return <section className="digital-route" aria-labelledby="digital-route-title">
    <header className="digital-route-hero">
      <div>
        <p>{project?.name}</p>
        <h1 id="digital-route-title">Mi ruta digital</h1>
      </div>
      <img src="/brand/foru-project-pavilion.png" alt="" />
    </header>
    <ol className="digital-route-stages">
      {stages.map(({ title, icon: Icon, detail, action, path }, index) => <li
        key={title}
        className={index === current ? 'is-current' : undefined}
        aria-current={index === current ? 'step' : undefined}
      >
        <span className="digital-route-marker" aria-hidden="true"><Icon size={18} /></span>
        <div><span className="digital-route-step">Etapa {index + 1}</span><h2>{title}</h2><p>{detail}</p></div>
        <PearlButton compact tone={index === current ? undefined : 'neutral'} to={path}>{action}</PearlButton>
      </li>)}
    </ol>
    {next && <aside className="project-start-feature">
      <h2>{next.title}</h2>
      {destination && <PearlButton compact tone="neutral" to={destination}>Volver a este paso</PearlButton>}
      {next.done && completion?.state !== 'failed' ? <p>Paso completado</p> : <PearlButton
        compact disabled={entry.busy || completionConflict} onClick={() => void completeStep(next)}
      >{completion?.state === 'saving' ? 'Guardando…' : completion?.state === 'failed' ? 'Reintentar guardado' : 'Marcar como hecho'}</PearlButton>}
      {completion?.state === 'failed' && <p role="alert">{completionConflict
        ? 'El paso cambió en otra ventana. Revisa la versión guardada en Kanban.'
        : 'Tu progreso quedó pendiente. Vuelve a intentar el guardado.'}</p>}
    </aside>}
    <footer className="digital-route-footer">
      <PearlButton compact tone="neutral" to={island}><MapPin size={18} aria-hidden="true" /> Ver mi isla</PearlButton>
    </footer>
  </section>;
}
