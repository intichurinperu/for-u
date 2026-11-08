import { landingOrigin, landingReturn } from '../../studio/navigation';
import { projectStartPath } from '../../workspace/navigation';
import { locationDestination, projectViewPath, workspaceSpaces, projectViews } from '../../workspace/navigation';
import { projectDestination, resumePath } from './workspaceFocusModel';
import Logo from '../../components/Logo';
import WorkspaceTools from './WorkspaceTools';
import { Tooltip } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import { useAreaDocuments } from './AreaDocuments';
import type { ModuleType } from '../../modules/moduleProjects';
import EmotionalCompass from './EmotionalCompass';
import { confirmWorkspaceNavigation } from '../../lib/useUnsavedNavigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { projectModuleType } from '../../modules/moduleProjects';
import { isSavedProject } from './areaModel';
import { FocusStatus } from './WorkspaceHome';
import { useWorkspaceFocus } from './WorkspaceFocus';
import { knownTaskTool } from './workspaceFocusModel';
import './unifiedDashboard.css';
import './workspace.css';
import './workspaceIdentity.css';
import './worldExperience.css';
import './workspaceNavigation.css';
import './workspaceHomeBar.css';

export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { remember, state: focusState } = useWorkspaceFocus();
  const store = useActiveProjectsStore();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false), [accountError, setAccountError] = useState(''); const accountRoot = useRef<HTMLDivElement>(null), accountButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!accountOpen) return; const outside = (event: PointerEvent) => { if (!accountRoot.current?.contains(event.target as Node)) setAccountOpen(false); }; const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setAccountOpen(false); accountButton.current?.focus(); } }; document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape); return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); }; }, [accountOpen]);
  useEffect(() => setAccountOpen(false), [location.pathname, location.search]);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);
  const projects = store.cloudUserId === user?.id ? Object.values(store.projectsById).filter(p => projectModuleType(p) && isSavedProject(p.id) && !p.cloudPending) : [];
  const requested = params.get('project');
  const project = requested ? projects.find(p => p.id === requested) : projects.find(p => p.id === store.activeProjectId) ?? projects[0];
  // Browsing a view must not rewrite shared account priorities on every URL change.
  // Explicit task/tool choices still use rememberNavigation below.
  const isToolSurface = location.pathname !== '/dashboard' && location.pathname !== '/dashboard/world';
  const isPageEditor = location.pathname === '/dashboard/tools/landing';
  const sourcePage = project && location.pathname === '/creator-studio' ? landingReturn(landingOrigin(params, project.id), project.id) : undefined;
  const isProjectSurface = location.pathname !== '/dashboard' || Boolean(requested);
  const query = project ? `?project=${encodeURIComponent(project.id)}` : '';
  const type = project ? projectModuleType(project)! : 'restaurant';
  const pageAccess = {
    restaurant: { icon: '📖', title: 'Mi menú', path: `/modules/restaurant/editor${query}`, help: 'Abre tu menú para editar platos, precios, fotos y publicación.' },
    ecommerce: { icon: '🛍️', title: 'Mi tienda', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tu tienda.' },
    hospitality: { icon: '🏡', title: 'Mi hospedaje', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tu hospedaje.' },
    tourism: { icon: '🗺️', title: 'Mis experiencias', path: `/dashboard/tools/landing${query}`, help: 'Abre el editor de la página de tus experiencias turísticas.' },
    courses: { icon: '🎓', title: 'Mis cursos', path: `/modules/courses/editor${query}`, help: 'Abre el editor de la página donde presentas tus cursos.' },
  }[type];
  const links = [
    { icon: '🎬', title: 'Editor de video', path: `/dashboard/tools/video${query}`, help: 'Edita videos estilo CapCut con subtítulos automáticos y plantillas.' },
    pageAccess,
    { icon: '🎨', title: 'Creator Studio', path: `/creator-studio${query}`, help: 'Continúa la ruta creativa y convierte textos en video.' },
    { icon: '📱', title: 'Mi perfil', path: `/dashboard/tools/profile${query}`, help: 'Organiza bio, destacados y publicaciones. No modifica Instagram.' },
    { icon: '✨', title: 'Mi propuesta', path: `/dashboard/tools/proposal${query}`, help: 'Define tus ofertas y prepara tu página sin cambiar de rubro.' },
    { icon: '📤', title: 'Uploads', path: `/dashboard/tools/images${query}`, help: 'Sube y organiza las fotos de tu negocio.' },
    { icon: '📅', title: 'Calendario', path: `/dashboard/tools/calendar${query}`, help: 'Planifica tus actividades y publicaciones.' },
    ...(type === 'restaurant' ? [{ icon: '🛒', title: 'Pedidos internos', path: `/modules/restaurant/orders${query}`, help: 'Gestiona pedidos, mesas, zonas y tarifas de delivery.' }] : []),
    { icon: '🧾', title: 'Compras y cotizaciones', path: `/dashboard/tools/orders${query}`, help: 'Gestiona compras y propuestas aceptadas de tus ofertas publicadas.' },
    { icon: '📊', title: 'Estadísticas', path: `/dashboard/tools/analytics${query}`, help: 'Consulta las visitas y clics registrados. Los clics no equivalen a ventas.' },
    { icon: '⚙️', title: 'Configuración', path: `/dashboard/settings${query}`, help: 'Gestiona tu cuenta y las conexiones disponibles.' },
  ];
  const rememberNavigation = (path: string) => {
    if (!project) return;
    const [pathname, search = ''] = path.split('?'); const destination = locationDestination(pathname, '?' + search, project.id);
    if (destination) remember({ projectId: project.id, destination });
  };
  const toolTitles: Record<string, string> = { 'content-creator': 'Creador visual', landing: 'Editor de página', bookings: 'Reservas y pedidos', content: 'Propuestas con IA', teleprompter: 'Teleprompter', video: 'Video', assistant: 'Asistente', automation: 'Respuestas automáticas' };
  const currentTitle = location.pathname === '/dashboard' ? (requested ? 'Mi tablero' : 'Mi espacio') : location.pathname === '/dashboard/world' ? 'Mi mundo'
    : params.get('view') === 'management' ? 'Gestión'
      : links.find(link => link.path.split('?')[0] === location.pathname)?.title
      ?? toolTitles[location.pathname.split('/').at(-1) ?? '']
      ?? (location.pathname.includes('/modules/') ? pageAccess.title : location.pathname.includes('/landing') ? 'Editor de página' : 'Creator Studio');
  const isLinkUnlocked = (_title: string) => Boolean(project);
  const renderLink = ({ icon, title, path, help }: typeof links[number]) => {
    const unlocked = isLinkUnlocked(title);
    return <Tooltip key={title} text={unlocked ? help : 'Elige un proyecto guardado para abrir esta herramienta.'}>
      <Link className={unlocked ? '' : 'workspace-nav-locked'} aria-current={location.pathname === path.split('?')[0] ? 'page' : undefined} to={unlocked && project ? path : '/dashboard?create=1'} onClick={() => { if (unlocked) rememberNavigation(path); }} tabIndex={unlocked ? 0 : -1}>
        <span className="workspace-nav-icon" aria-hidden="true">{icon}</span>{title}
      </Link>
    </Tooltip>;
  };
  return <div className={`workspace-shell workspace-shell-immersive ${isToolSurface ? 'is-tool-focused' : ''} ${!isProjectSurface && !isToolSurface ? 'is-home' : ''} ${isPageEditor ? 'is-page-editor' : ''} ${(location.pathname === '/content-creator' || location.pathname === '/creator-studio' && params.get('tab') === 'profile' && params.get('piece')) ? 'is-piece-focused' : ''} ${params.get('setup') === '1' ? 'is-guiding' : ''}`}>
    {isToolSurface && <aside className={`workspace-sidebar ${menuOpen ? 'menu-open' : ''}`}>
      <Link className="workspace-brand" to="/dashboard" aria-label="FOR U · Mis proyectos"><Logo /></Link>

      {project && <TaskProgress projectId={project.id} type={type} />}
      <Tooltip text="Crea otro proyecto y conserva los que ya tienes en tu cuenta."><Link className="workspace-new magic-button-primary" to="/dashboard?create=1">＋ Crear nuevo proyecto</Link></Tooltip>
      <DSButtonSecondary ref={menuButton} className="workspace-menu-toggle" aria-controls="workspace-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}>☰</DSButtonSecondary>
      <Link className="workspace-home-link" to="/dashboard">Mis proyectos y Hoy</Link>
      <details className="workspace-account-menu"><summary aria-label="Opciones de cuenta">•••</summary><Link to="/dashboard">Mis proyectos y Hoy</Link><DSButtonSecondary onClick={() => { if (confirmWorkspaceNavigation()) { void signOut(); navigate('/login'); } }}>Cerrar sesión</DSButtonSecondary></details><Link className="immersive-new-project" to="/dashboard?create=1">＋ Proyecto</Link><nav id="workspace-navigation" aria-label="Navegación de tu negocio" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } }}>
        {links.filter(link => ['Editor de video', pageAccess.title, 'Creator Studio', 'Mi propuesta', 'Calendario'].includes(link.title)).map(renderLink)}
        <WorkspaceTools links={links} projectId={project?.id} type={type} onNavigate={rememberNavigation} />
      </nav>
      {project && <PendingTasks projectId={project.id} type={type} />}
      <p>Tu espacio para avanzar.<br />Y también para respirar.</p>
      <DSButtonSecondary onClick={() => { if (confirmWorkspaceNavigation()) { void signOut(); navigate('/login'); } }}>Salir</DSButtonSecondary>
    </aside>}

    <div className="workspace-main">
      {!isProjectSurface && !isToolSurface && <><header className="workspace-home-bar"><Link className="workspace-project-logo" to="/dashboard" aria-label="FOR U · Mis proyectos"><Logo /></Link><div className="workspace-home-actions"><Link className="workspace-home-create" to="/dashboard?create=1"><span aria-hidden="true">＋</span> Nuevo proyecto</Link><div className="workspace-home-account" ref={accountRoot}><button type="button" ref={accountButton} aria-label="Opciones de cuenta" aria-expanded={accountOpen} aria-controls="workspace-home-account-actions" onClick={() => setAccountOpen(!accountOpen)}>•••</button>{accountOpen && <nav id="workspace-home-account-actions" aria-label="Mi cuenta"><Link to="/dashboard/settings">Mi cuenta y ajustes</Link><button type="button" onClick={async () => { if (!confirmWorkspaceNavigation()) return; try { await signOut(); navigate('/login'); } catch (error) { setAccountError((error as Error).message); } }}>Cerrar sesión</button></nav>}</div></div></header>{accountError && <p className="workspace-home-error" role="alert">{accountError}</p>}</>}

      {studioIdea||designReturn?<header className="workspace-focus-bar workspace-studio-idea-bar">
        <Logo compact/>
        {designReturn
          ? <PearlButton tone="neutral" compact onClick={()=>{if(confirmWorkspaceNavigation()){if(location.state?.fromStudioDesign)navigate(-1);else navigate(designReturn,{replace:true});}}}>Volver a mi diseño</PearlButton>
          : <PearlButton tone="neutral" compact to={project?projectStartPath(project.id,params.get('task')):'/dashboard'}>Mi ruta</PearlButton>}
      </header>:isToolSurface?<header className={`workspace-focus-bar${location.pathname==='/creator-studio'?' is-studio-focus-bar':''}`}>{location.pathname!=='/content-creator'&&<Link to={returnToArea ? areaReturnPath : project ? projectStartPath(project.id,params.get('task')) : '/dashboard'}>← {returnToArea ? 'Volver al área' : 'Mi ruta digital'}{project ? ` | ${project.name}` : ''}</Link>}{location.pathname==='/creator-studio'&&<div className="workspace-focus-center-logo" aria-hidden="true"><Logo compact/></div>}<span>{location.pathname==='/creator-studio'?'':project?.name||'Mis proyectos'}</span><details key={location.pathname+location.search} className="workspace-focus-menu"><summary aria-label="Más opciones del proyecto">•••</summary><nav aria-label="Cambiar espacio">{project&&workspaceSpaces(project.id,type).filter(space=>space.path.split('?')[0]!==location.pathname).map(space=><Link key={space.id} to={space.path}>{space.title}</Link>)}{project&&projectViews.map(view=><Link key={view} to={projectViewPath(project.id,view)+(view!=='world' && backToIsland ? '&return=island' + (returnToArea ? `&from=${areaOrigin}` : '') : '')}>{({map:'Mapa',kanban:'Kanban',calendar:'Calendario',world:'Mi mundo'})[view]}</Link>)}<label>Proyecto activo<select value={project?.id??''} onChange={event=>{if(!confirmWorkspaceNavigation())return;store.switchProject(event.target.value);const next=projects.find(p=>p.id===event.target.value);if(next)navigate(projectStartPath(next.id));}}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><WorkspaceTools links={links} projectId={project?.id} type={type} onNavigate={rememberNavigation}/><Link to="/dashboard">Mis proyectos y Hoy</Link><Link to="/dashboard?create=1">Crear otro proyecto</Link></nav></details></header>:isProjectSurface&&!guiding&&<header className={`workspace-project-bar${routeView || islandView ? " is-route-header" : ""}`}>
        <div className="workspace-project-identity"><Link className="workspace-project-back" to={projectBack}>← {projectBackLabel}</Link><Link className="workspace-project-logo" to="/dashboard" aria-label="FOR U · Mis proyectos"><Logo/></Link><label><span className="sr-only">Proyecto activo</span><select aria-label="Proyecto activo" value={project?.id??''} onChange={event=>{if(!confirmWorkspaceNavigation())return;store.switchProject(event.target.value);const next=projects.find(p=>p.id===event.target.value);if(next)navigate(projectStartPath(next.id));}}><option value="" disabled>Elige un proyecto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
        {!routeView && !islandView && <nav className="workspace-view-switch" aria-label="Vistas del proyecto">{project&&projectViews.map(view=><Link key={view} aria-current={(view==='world'?location.pathname==='/dashboard/world':location.pathname==='/dashboard'&&(params.get('view')==='management'?'map':params.get('view')||'map')===view)?'page':undefined} to={projectViewPath(project.id,view)+(view!=='world' && backToIsland ? '&return=island' + (returnToArea ? `&from=${areaOrigin}` : '') : '')}>{({map:'Mapa',kanban:'Kanban',calendar:'Calendario',world:'Mi mundo'})[view]}</Link>)}</nav>}
        {!routeView && !islandView && <details className="workspace-project-menu" key={location.pathname+location.search}><summary aria-label="Abrir espacios y herramientas">Trabajar <span aria-hidden="true">⌄</span></summary><nav aria-label="Espacios del proyecto">{project&&workspaceSpaces(project.id,type).map(space=><Link key={space.id} to={space.path}>{space.title}</Link>)}<WorkspaceTools links={links} projectId={project?.id} type={type} onNavigate={rememberNavigation}/><Link to="/dashboard">Mis proyectos</Link><Link to="/dashboard?create=1">Nuevo proyecto</Link></nav></details>}
      </header>}
      <div className="workspace-body">
        {project && !isToolSurface && location.pathname !== '/dashboard' && <Link className="workspace-map-return" to={projectViewPath(project.id, 'map')}>← Volver a mi mapa</Link>}
        <FocusStatus />
        {requested && !project ? <section className="magic-card" role={store.isCloudSyncing ? 'status' : 'alert'}><h1>{store.isCloudSyncing || store.cloudUserId !== user?.id ? 'Cargando proyecto…' : 'Este proyecto no está disponible'}</h1><p>{store.projectLoadError || 'No se abrirá otro proyecto en su lugar.'}</p>{store.projectLoadError && <DSButtonSecondary onClick={() => { if (user) void store.hydrateFromSupabase(user.id); }}>Reintentar</DSButtonSecondary>}<Link to="/dashboard">Volver a mis proyectos</Link></section> : children}
      </div>
    </div>

    {project && params.get('welcome') === '1' && <EmotionalCompass key={project.id} projectId={project.id} onDone={() => { const next = new URLSearchParams(params); next.delete('welcome'); setParams(next, { replace: true }); }} />}
  </div>;
}

function PendingTasks({ projectId, type }: { projectId: string; type: ModuleType }) {
  const { entry } = useAreaDocuments(projectId, type);
  const count = entry?.loaded ? entry.tasks.tasks.filter(task => !task.done).length : null;
  return <Link className="workspace-pending" to={`/dashboard?project=${projectId}&view=management`}>Mis próximos pasos{count !== null && count > 0 && <span aria-label={`${count} tareas pendientes`}>{count}</span>}</Link>;
}

function TaskProgress({ projectId, type }: { projectId: string; type: ModuleType }) { const { entry } = useAreaDocuments(projectId, type); if (!entry?.loaded) return null; const done = entry.tasks.tasks.filter(t => t.done).length, total = entry.tasks.tasks.length; return <div className="foru-route-progress-bar"><small>{done}/{total} pasos · {entry.taskDirty ? "pendientes de guardar" : entry.taskRevision ? "guardados" : "guía inicial"}</small><progress aria-label="Progreso de tareas del proyecto" max={total || 1} value={done} /></div>; }
