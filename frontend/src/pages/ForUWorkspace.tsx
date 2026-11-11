import { ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import '../toolkit/toolkit.css';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import EmotionalOnboardingModal from '../components/EmotionalOnboardingModal';
import FloatingReward, { type FloatingRewardBurst } from '../components/FloatingReward';
import IndustryOnboardingModal, { type IndustryOnboardingInput } from '../components/IndustryOnboardingModal';
import Logo from '../components/Logo';
import JourneyMap, { projectJourney } from '../components/JourneyMap';
import { useAuth } from '../contexts/AuthContext';
import { planConfigs, type ForUNextAction, useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { projectModuleType } from '../modules/moduleProjects';

const World3D = lazy(() => import('../components/World3D'));
const ActionView = lazy(() => import('../components/ActionView'));
const DigitalRouteView = lazy(() => import('../components/DigitalRouteView'));
const GanttView = lazy(() => import('../components/GanttView'));
const KanbanView = lazy(() => import('../components/KanbanView'));
const IndustryKitView = lazy(() => import('../components/IndustryKitView'));
const ForUChat = lazy(() => import('../components/ForUChat'));
const PersonalDashboard = lazy(() => import('../components/PersonalDashboard'));
const NodeDetailPanel = lazy(() => import('../components/NodeDetailPanel'));
const Toolkit = lazy(() => import('../toolkit/Toolkit'));

type WorkspaceScreen = 'projects' | 'dashboard' | 'action' | 'project' | 'world' | 'tools';
type ProjectSubview = 'route' | 'kit' | 'kanban' | 'map' | 'gantt';

export default function ForUWorkspace() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [screen, setScreen] = useState<WorkspaceScreen>('dashboard');
  const [projectSubview, setProjectSubview] = useState<ProjectSubview>('route');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [completedAction, setCompletedAction] = useState<ForUNextAction | null>(null);
  const [rewardBurst, setRewardBurst] = useState<FloatingRewardBurst | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);

  useActiveProjectsStore((state) => state.activeProjectIds);
  useActiveProjectsStore((state) => state.projectsById);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const coins = useActiveProjectsStore((state) => state.coins);
  const dailyStreak = useActiveProjectsStore((state) => state.dailyStreak);
  const userPlan = useActiveProjectsStore((state) => state.userPlan);
  const features = useActiveProjectsStore((state) => state.features);
  const planLimitNotice = useActiveProjectsStore((state) => state.planLimitNotice);
  const clearPlanLimitNotice = useActiveProjectsStore((state) => state.clearPlanLimitNotice);
  const switchProject = useActiveProjectsStore((state) => state.switchProject);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const clearFocus = useActiveProjectsStore((state) => state.clearFocus);
  const setView = useActiveProjectsStore((state) => state.setView);
  const getProjectById = useActiveProjectsStore((state) => state.getProjectById);
  const getNextAction = useActiveProjectsStore((state) => state.getNextAction);
  const getPersonalDashboardProjects = useActiveProjectsStore((state) => state.getPersonalDashboardProjects);
  const generateNextAction = useActiveProjectsStore((state) => state.generateNextAction);
  const completeNextAction = useActiveProjectsStore((state) => state.completeNextAction);
  const openProject = useActiveProjectsStore((state) => state.openProject);
  const hydrateFromSupabase = useActiveProjectsStore((state) => state.hydrateFromSupabase);
  const clearCloudUser = useActiveProjectsStore((state) => state.clearCloudUser);
  const cloudUserId = useActiveProjectsStore((state) => state.cloudUserId);
  const isCloudSyncing = useActiveProjectsStore((state) => state.isCloudSyncing);

  useEffect(() => {
    if (!user?.id) return;
    void hydrateFromSupabase(user.id);
  }, [hydrateFromSupabase, user?.id]);

  const dashboardProjects = getPersonalDashboardProjects();
  const currentProjectId = selectedProjectId ?? activeProjectId ?? dashboardProjects[0]?.project.id ?? null;
  const currentProject = currentProjectId ? getProjectById(currentProjectId) : null;
  const currentAction = currentProjectId ? getNextAction(currentProjectId) : null;
  const planLabel = planConfigs[userPlan ?? 'free'].label;

  function showUpgrade(title: string, message: string) {
    useActiveProjectsStore.setState({
      planLimitNotice: {
        title,
        message,
        feature: 'kanban',
      },
    });
  }

  function openDashboard(projectId?: string) {
    if (projectId) {
      switchProject(projectId);
      setSelectedProjectId(projectId);
    }

    deselectNode();
    clearFocus();
    setCompletedAction(null);
    setScreen('dashboard');
  }

  function selectProject(projectId: string) {
    switchProject(projectId);
    setSelectedProjectId(projectId);
    setCompletedAction(null);
    deselectNode();
    clearFocus();
  }

  function startProject(projectId: string) {
    selectProject(projectId);
    generateNextAction(projectId);
    setScreen('action');
  }

  function createIndustryProject(input: IndustryOnboardingInput) {
    const projectId = openProject({
      name: input.projectName,
      industryKey: input.industryKey,
      tangibleGoal: `Vender ${input.offerType} en ${input.location} a ${input.idealTraveler}.`,
      targetFeelings: input.industryKey === 'gastronomy' ? ['abundance', 'confidence', 'joy'] : ['connection', 'abundance', 'confidence'],
      strategyProfile: {
        objective: input.objective,
        offerType: input.offerType,
        location: input.location,
        idealTraveler: input.idealTraveler,
        primaryChannel: input.primaryChannel,
        availableAssets: input.assets,
      },
    });
    if (!projectId) return;
    const createdProject = useActiveProjectsStore.getState().getProjectById(projectId);
    if (!createdProject?.industryKey) return;

    selectProject(projectId);
    setProjectSubview('route');
    setScreen('dashboard');
  }

  function viewProject(projectId: string) {
    selectProject(projectId);
    const nextSubview: ProjectSubview = 'route';
    setView('dashboard');
    setProjectSubview(nextSubview);
    setScreen('project');
  }

  function openWorld() {
    if (!features.world3D) {
      showUpgrade('Desbloquea el Mundo 3D con Pro', 'Mi Mundo es parte de Pro: islas, progreso visual y exploración 3D cuando quieras inspirarte.');
      return;
    }

    deselectNode();
    clearFocus();
    setScreen('world');
  }

  function changeProjectSubview(subview: ProjectSubview) {
    if ((subview === 'kanban' || subview === 'gantt') && !features.kanban) {
      showUpgrade(
        'Upgrade a Pro para ver vistas avanzadas',
        'La Ruta Digital y el tablero personal siguen disponibles en Gratis. Pro desbloquea Kanban, mapa mental y cronograma.',
      );
      return;
    }

    deselectNode();
    clearFocus();
    setProjectSubview(subview);
    setView(subview === 'route' || subview === 'kit' ? 'dashboard' : subview);
  }

  function completeAction(point: { x: number; y: number }) {
    if (!currentProjectId || !currentAction) return;

    const completed = completeNextAction(currentProjectId, currentAction.id);
    if (!completed) return;

    setCompletedAction(currentAction);
    setRewardBurst({
      id: `${Date.now()}-${Math.random()}`,
      x: point.x,
      y: point.y,
      coins: currentAction.rewardCoins,
      xp: currentAction.isFallback ? 5 : 20,
    });
    window.setTimeout(() => setRewardBurst(null), 1500);
  }

  async function handleSignOut() {
    await signOut();
    clearCloudUser();
    navigate('/login', { replace: true });
  }

  if (user && (cloudUserId !== user.id || isCloudSyncing)) return <ScreenLoader label="Preparando tus proyectos..." />;
  if (screen === 'dashboard' && !currentProject) return <main className="hoy-shell"><section className="hoy-view"><p className="hoy-greeting">Hola, {user?.user_metadata?.display_name || 'emprendedora'}</p><div className="hoy-task"><h1>Elige el rubro de tu negocio</h1><p className="hoy-description">Solo necesitamos la base para preparar tu primer paso.</p></div><DSButtonSecondary className="hoy-action-btn" onClick={()=>setIsIndustryModalOpen(true)}>Empezar ahora</DSButtonSecondary></section><IndustryOnboardingModal isOpen={isIndustryModalOpen} onClose={()=>setIsIndustryModalOpen(false)} onCreateIndustryProject={createIndustryProject}/></main>;
  if ((screen === 'dashboard' || screen === 'tools') && currentProject) return <Suspense fallback={<ScreenLoader label="Abriendo tu estudio..." />}><Toolkit project={currentProject} onBack={() => setScreen('projects')} /></Suspense>;

  return (
    <main className="foru-personal-shell">
      <Toaster position="bottom-center" toastOptions={{ className: 'foru-hot-toast' }} />
      <header
        className="foru-personal-header"
        style={{
          background: 'var(--color-fondo)',
          color: 'var(--color-texto)',
          fontFamily: 'var(--font-principal)',
        }}
      >
        <Link to="/" className="foru-shell-logo" aria-label="FOR U">
          <Logo />
        </Link>

        <label className="foru-personal-project-select" aria-label="Proyecto actual">
          <span style={{ color: 'var(--color-texto-suave)', fontFamily: 'var(--font-principal)' }}>
            Proyecto actual
          </span>
          <select
            value={currentProjectId ?? ''}
            onChange={(event) => openDashboard(event.target.value)}
            style={{
              color: 'var(--color-texto-suave)',
              fontFamily: 'var(--font-principal)',
            }}
          >
            {dashboardProjects.map(({ project }) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <div className="foru-personal-header-stats">
          <DSButtonSecondary type="button" className="magic-button magic-button-soft" disabled={!currentProject} onClick={() => setScreen('tools')}>Mi estudio · Herramientas</DSButtonSecondary>
          <DSButtonSecondary
            type="button"
            className="magic-button magic-button-soft"
            onClick={() => (screen === 'project' ? openDashboard(currentProjectId ?? undefined) : currentProjectId && viewProject(currentProjectId))}
            style={{
              borderColor: 'transparent',
              color: 'var(--color-texto)',
              fontFamily: 'var(--font-principal)',
            }}
          >
            {screen === 'project' ? 'Volver al tablero' : 'Continuar ruta'}
          </DSButtonSecondary>

          <details className="foru-header-more">
            <summary style={{ fontFamily: 'var(--font-principal)' }}>Más</summary>
            <div>
              <Link to="/dashboard?view=projects">Mis proyectos por rubro</Link>
              {currentProject && projectModuleType(currentProject) === 'restaurant' && <Link to={`/modules/restaurant?project=${encodeURIComponent(currentProject.id)}`}>Mi restaurante · Menú y logística</Link>}
              <DSButtonSecondary type="button" onClick={() => setIsChatOpen(true)}>Chat con For U</DSButtonSecondary>
              <DSButtonSecondary type="button" onClick={openWorld}>Mi Mundo</DSButtonSecondary>
              <span>Monedas: {coins}</span>
              <Link to="/whatsapp">WhatsApp</Link>
              <Link to="/pricing">Plan {planLabel}</Link>
              <span>Racha: {dailyStreak} {dailyStreak === 1 ? 'dia' : 'dias'}</span>
              <DSButtonSecondary type="button" onClick={handleSignOut}>Salir</DSButtonSecondary>
            </div>
          </details>
        </div>
      </header>

      {screen === 'world' ? (
        <section className="foru-integrated-view">
          <DSButtonSecondary type="button" className="foru-integrated-back" onClick={() => openDashboard(currentProjectId ?? undefined)}>
            ← Volver al tablero
          </DSButtonSecondary>
          <Suspense fallback={<WorldLoader />}>
            <World3D onBackToMap={() => openDashboard(currentProjectId ?? undefined)} onOpenProject={viewProject} />
          </Suspense>
        </section>
      ) : screen === 'project' ? (
        <section className="foru-integrated-view">
          <div className="foru-project-workbar">
            <DSButtonSecondary type="button" onClick={() => openDashboard(currentProjectId ?? undefined)}>
              ← Volver al tablero
            </DSButtonSecondary>
            <p>{currentProject?.name ? `Aquí tienes todo lo de ${currentProject.name}.` : 'Aquí tienes el proyecto completo.'}</p>
            <div className="foru-project-subtabs" aria-label="Vistas del proyecto">
              <DSButtonSecondary type="button" className={projectSubview === 'route' ? 'is-active' : ''} onClick={() => setProjectSubview('route')}>
                🗺️ Ruta
              </DSButtonSecondary>
              {currentProject?.industryKey ? (
                <DSButtonSecondary type="button" className={projectSubview === 'kit' ? 'is-active' : ''} onClick={() => setProjectSubview('kit')}>
                  🧳 Kit
                </DSButtonSecondary>
              ) : null}
              <DSButtonSecondary type="button" className={projectSubview === 'kanban' ? 'is-active' : ''} onClick={() => changeProjectSubview('kanban')}>
                📋 Tareas
              </DSButtonSecondary>
              <DSButtonSecondary type="button" className={projectSubview === 'map' ? 'is-active' : ''} onClick={() => changeProjectSubview('map')}>
                🧠 Mapa
              </DSButtonSecondary>
              <DSButtonSecondary type="button" className={projectSubview === 'gantt' ? 'is-active' : ''} onClick={() => changeProjectSubview('gantt')}>
                📊 Tiempo
              </DSButtonSecondary>
            </div>
          </div>

          {projectSubview === 'route' ? (
            <Suspense fallback={<ScreenLoader label="Cargando ruta..." />}>
              <DigitalRouteView
                project={currentProject}
                onOpenLanding={() => {
                  window.open('/editor', '_blank', 'noopener,noreferrer');
                }}
                onOpenTasks={() => changeProjectSubview('kanban')}
                onStartAction={() => currentProjectId && startProject(currentProjectId)}
              />
            </Suspense>
          ) : null}
          {projectSubview === 'kit' ? (
            <Suspense fallback={<ScreenLoader label="Cargando kit..." />}>
              <IndustryKitView
                project={currentProject}
                onStart={() => currentProjectId && startProject(currentProjectId)}
                onOpenTasks={() => changeProjectSubview('kanban')}
              />
            </Suspense>
          ) : null}
          {projectSubview === 'kanban' ? (
            <Suspense fallback={<ScreenLoader label="Cargando tareas..." />}>
              <KanbanView />
            </Suspense>
          ) : null}
          {projectSubview === 'map' ? (
            <Suspense fallback={<ScreenLoader label="Cargando mapa..." />}>
              {currentProject && <JourneyMap steps={projectJourney(currentProject)} onSelect={step => { if (step.nodeId) useActiveProjectsStore.getState().selectNode(step.nodeId); }} />}
              <AnimatePresence>
                {selectedNodeId ? <NodeDetailPanel key={selectedNodeId} /> : null}
              </AnimatePresence>
            </Suspense>
          ) : null}
          {projectSubview === 'gantt' ? (
            <Suspense fallback={<ScreenLoader label="Cargando cronograma..." />}>
              <GanttView />
            </Suspense>
          ) : null}
        </section>
      ) : screen === 'action' ? (
        <Suspense fallback={<ScreenLoader label="Cargando acción..." />}>
          <ActionView
            project={currentProject}
            action={currentAction}
            completedAction={completedAction}
            onComplete={completeAction}
            onNext={() => setCompletedAction(null)}
            onBack={() => openDashboard(currentProjectId ?? undefined)}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<ScreenLoader label="Cargando tablero..." />}>
          <PersonalDashboard
            name={user?.user_metadata?.display_name || "emprendedora"}
            planLabel={planLabel}
            projects={dashboardProjects}
            onViewProject={viewProject}
            onCreateIndustryProject={() => setIsIndustryModalOpen(true)}
          />
        </Suspense>
      )}

      <AnimatePresence>
        {planLimitNotice ? (
          <div className="foru-upgrade-backdrop" role="dialog" aria-modal="true">
            <div className="foru-upgrade-modal">
              <span>✨</span>
              <h2>{planLimitNotice.title}</h2>
              <p>{planLimitNotice.message}</p>
              <div>
                <DSButtonSecondary type="button" onClick={() => navigate('/pricing')}>Ver planes</DSButtonSecondary>
                <DSButtonSecondary type="button" onClick={clearPlanLimitNotice}>Ahora no</DSButtonSecondary>
              </div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {currentProject ? <EmotionalOnboardingModal project={currentProject} /> : null}
      </AnimatePresence>
      <Suspense fallback={null}>
        <ForUChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </Suspense>
      <IndustryOnboardingModal
        isOpen={isIndustryModalOpen}
        onClose={() => setIsIndustryModalOpen(false)}
        onCreateIndustryProject={createIndustryProject}
      />
      <FloatingReward burst={rewardBurst} />
    </main>
  );
}

function WorldLoader() {
  return (
    <section className="foru-world-loader">
      <span>🌍</span>
      <strong>Cargando Mi Mundo...</strong>
    </section>
  );
}

function ScreenLoader({ label }: { label: string }) {
  return (
    <section className="foru-world-loader">
      <span>✨</span>
      <strong>{label}</strong>
    </section>
  );
}
