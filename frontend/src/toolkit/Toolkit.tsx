import {savedAreaAchievement} from '../pages/dashboard/areaPersistence';
import { Card as DSCard } from '../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput } from '../components/ui/DesignSystem';

import { lazy, Suspense, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChartNoAxesCombined,
  Check,
  Images,
  LayoutTemplate,
  MessageCircle,
  Scissors,
  Sparkles,
  WandSparkles,
  X,
  Menu,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { type ForUActiveProject } from "../stores/useActiveProjectsStore";
import { ToolkitProvider, useToolkit } from "./ToolkitContext";
import { businessFromProject, type ToolId } from "./types";
import { type FocusState, type Segment } from "./engine";
import { useDialogFocus } from "./useDialogFocus";
import TodayView from "./TodayView";
import { todayRoute, type TodayProgress } from "./todayModel";
import "./toolkit.css";
import { useAreaDocuments } from '../pages/dashboard/AreaDocuments';
import { projectModuleType } from '../modules/moduleProjects';
const SocialProfile = lazy(() => import("../social/SocialProfile"));
const ProposalEditor = lazy(() => import("../proposal/ProposalEditor"));
const TemplateLibrary = lazy(() => import("./TemplateLibrary"));
const ConnectionStatus = lazy(() => import("./ConnectionStatus"));
const ContentStudio = lazy(() => import("./ContentStudio"));
const Teleprompter = lazy(() => import("./Teleprompter"));
const VideoEditor = lazy(() => import("./VideoEditor"));
const ImageLibrary = lazy(() => import("./ImageLibrary"));
const Calendar = lazy(() => import("./Calendar"));
const LandingBuilder = lazy(() => import("./LandingBuilder"));
const ContextAssistant = lazy(() => import("./ContextAssistant"));
const Bookings = lazy(() =>
  import("./BusinessTools").then((module) => ({ default: module.Bookings })),
);
const Analytics = lazy(() =>
  import("./BusinessTools").then((module) => ({ default: module.Analytics })),
);
const Automation = lazy(() =>
  import("./BusinessTools").then((module) => ({ default: module.Automation })),
);

const tools = [
  { id: "profile", name: "Mi perfil y publicaciones", description: "Bio, destacados y piezas de contenido de este proyecto.", Icon: Sparkles, color: "lilac", label: "ORGANIZA", minutes: 5 },
  { id: "proposal", name: "Mi propuesta", description: "Tu idea, tus ofertas y el mensaje de tu página.", Icon: Sparkles, color: "lilac", label: "DEFINE", minutes: 5 },
  {
    id: "content",
    name: "Crear contenido",
    description: "Dale palabras a tus ideas. Captions, guiones y hashtags.",
    Icon: WandSparkles,
    color: "lilac",
    label: "CREA",
    minutes: 5,
  },
  {
    id: "teleprompter",
    name: "Teleprompter",
    description: "Tu guion cerca. Tu mirada en la cámara.",
    Icon: Camera,
    color: "rose",
    label: "GRABA",
    minutes: 5,
  },
  {
    id: "video",
    name: "Editor de video",
    description: "Recorta pausas y agrega subtítulos a tu historia.",
    Icon: Scissors,
    color: "peach",
    label: "DALE FORMA",
    minutes: 10,
  },
  {
    id: "images",
    name: "Tus imágenes",
    description: "Un lugar para las fotos que cuentan quién eres.",
    Icon: Images,
    color: "sage",
    label: "ORGANIZA",
    minutes: 3,
  },
  {
    id: "calendar",
    name: "Calendario",
    description: "Haz espacio para tu próxima publicación.",
    Icon: CalendarDays,
    color: "blue",
    label: "PLANIFICA",
    minutes: 5,
  },
  {
    id: "analytics",
    name: "Tus resultados",
    description: "Mira tus avances y encuentra tu siguiente paso.",
    Icon: ChartNoAxesCombined,
    color: "yellow",
    label: "APRENDE",
    minutes: 3,
  },
  {
    id: "assistant",
    name: "Asistente FOR U",
    description: "Una guía que conoce el paso en el que estás.",
    Icon: Sparkles,
    color: "lilac",
    label: "CONVERSEMOS",
    minutes: 2,
  },
  {
    id: "landing",
    name: "Tu página",
    description: "Un espacio propio para presentar tu negocio.",
    Icon: LayoutTemplate,
    color: "sage",
    label: "COMPARTE",
    minutes: 15,
  },
  {
    id: "bookings",
    name: "Reservas y pedidos",
    description: "Convierte un «me interesa» en una conversación.",
    Icon: Check,
    color: "rose",
    label: "RECIBE",
    minutes: 5,
  },
  {
    id: "automation",
    name: "Respuestas automáticas",
    description: "Prepara tu bienvenida de WhatsApp e Instagram.",
    Icon: MessageCircle,
    color: "blue",
    label: "CONECTA",
    minutes: 10,
  },
] as const;
const demoProject: ForUActiveProject = {
  id: "demo",
  name: "Mi pequeño negocio",
  industryKey: "gastronomy",
  tangibleGoal: "Conseguir mis primeros pedidos",
  strategyProfile: {
    offerType: "postres artesanales",
    idealTraveler: "personas que disfrutan compartir",
    objective: "ventas",
    location: "Lima",
  },
  status: "active",
  targetFeelings: [],
  tasks: [],
  nodes: [],
  edges: [],
  digitalRoute: [],
  currentRouteIndex: 0,
  createdAt: "",
  updatedAt: "",
};
export default function Toolkit({
  project,
  onBack,
  demo = false,
  initialTool,
  initialPage,
  embedded = false,
}: {
  project: ForUActiveProject;
  onBack?: () => void;
  demo?: boolean;
  initialTool?: ToolId;
  initialPage?: 'today' | 'templates';
  embedded?: boolean;
}) {
  const { user } = useAuth();
  const userId = demo ? "demo" : user?.id;
  if (!userId) return <p>Inicia sesión para abrir tus herramientas.</p>;
  return (
    <ToolkitProvider
      key={`${userId}:${project.id}`}
      userId={userId}
      projectId={project.id}
      business={businessFromProject(project)}
      demo={demo}
    >
      <ToolkitShell project={project} onBack={onBack} initialTool={initialTool} initialPage={initialPage} embedded={embedded} />
    </ToolkitProvider>
  );
}
export function ToolkitDemo() {
  return <Toolkit project={demoProject} demo />;
}
function ToolkitShell({
  project,
  onBack,
  initialTool,
  initialPage,
  embedded = false,
}: {
  project: ForUActiveProject;
  onBack?: () => void;
  initialTool?: ToolId;
  initialPage?: 'today' | 'templates';
  embedded?: boolean;
}) {
  const { user, signOut } = useAuth();
  const {
    state,
    chooseState,
    adaptive,
    setAdaptive,
    loading,
    loadError,
    status,
    reload,
    business,
    demo,
    docs,
  } = useToolkit();
  const [tool, setTool] = useState<ToolId | null>(initialTool ?? null);
  const [page, setPage] = useState<"today" | "tool" | "templates">(initialTool ? 'tool' : initialPage ?? 'today');
  const [menu, setMenu] = useState(false);
  const [menuPage, setMenuPage] = useState("root");
  const menuRef = useRef<HTMLElement>(null);
  useDialogFocus(menuRef, menu, () => setMenu(false));
  const [script, setScript] = useState("");
  const [captions, setCaptions] = useState<Segment[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const current = tools.find((item) => item.id === tool);
  const tasks = project.nodes.filter((node) => node.kind === "task");
  const completed = tasks.filter(
    (node) => node.completedAt || node.taskStatus === "done",
  ).length;
  const nextTask = todayRoute(
    project,
    (docs.today as TodayProgress | undefined) ?? { completed: [] },
  ).task.title;
  const navigate=useNavigate();
  function open(next: ToolId) {
    if(next==='calendar'&&!demo){navigate(`/dashboard?project=${encodeURIComponent(project.id)}&view=calendar`);return;}
    setTool(next);
    setPage("tool");
    setMenu(false);
    setChatOpen(false);
  }
  function home() {
    setTool(null);
    setPage("today");
    setMenu(false);
    setChatOpen(false);
  }
  const group = (ids: ToolId[]) =>
    ids.map((id) => {
      const item = tools.find((t) => t.id === id)!;
      return (
        <DSButtonSecondary key={id} onClick={() => open(id)}>
          <item.Icon size={20} />
          <span>{item.name}</span>
        </DSButtonSecondary>
      );
    });
  return (
    <div className="tk-app hoy-shell" data-focus={state}>
      {!embedded && <header className="hoy-topbar" inert={menu}>
        <DSButtonSecondary
          className="hoy-menu-toggle"
          onClick={() => {
            setMenuPage("root");
            setMenu(true);
          }}
          aria-label="Abrir menú"
          aria-expanded={menu}
        >
          <Menu size={22} />
        </DSButtonSecondary>
        {page !== "today" && (
          <DSButtonSecondary className="hoy-home" onClick={home}>
            <ArrowLeft size={16} /> Hoy
          </DSButtonSecondary>
        )}
        <span className="hoy-wordmark" aria-label="FOR U">
          for u
        </span>
      </header>}
      <main
        className={"hoy-main" + (page === "today" ? " is-today" : tool === "landing" ? " is-page-editor" : "")}
        inert={menu}
      >
        {loading ? (
          <p className="hoy-loading" role="status">
            Preparando tu siguiente paso…
          </p>
        ) : loadError ? <DSCard as="section" className="tk-card"><p role="alert">{status}</p><DSButtonSecondary onClick={() => void reload()}>Reintentar carga</DSButtonSecondary></DSCard> : page === "today" ? (
          <TodayView project={project} onHelp={() => setChatOpen(true)} />
        ) : page === "templates" ? (
          <Suspense fallback={<p>Cargando plantillas…</p>}>
            <TemplateLibrary />
          </Suspense>
        ) : (
          <>
            <header className="hoy-tool-heading" hidden={tool === "video" || tool === "teleprompter" || tool === "content" || tool === "proposal" || tool === "landing" || (tool === "profile" && new URLSearchParams(window.location.search).has("piece"))}>
              <h1>{current?.name}</h1>
              <p>{current?.description}</p>
            </header>
            <Suspense fallback={<p role="status">Abriendo tu herramienta…</p>}>
              {tool === "content" && (
                <ContentStudio key={new URLSearchParams(window.location.search).get('section')||'content'}
                  onScript={(text) => {
                    setScript(text);
                    open("teleprompter");
                  }}
                />
              )}
              {tool === "teleprompter" && (
                <Teleprompter
                  initialScript={script}
                  onEdit={(file, subtitles) => {
                    setVideo(file);
                    setCaptions(subtitles);
                    open("video");
                  }}
                />
              )}
              {tool === "video" && (
                <VideoEditor initialFile={video} initialSubtitles={captions} />
              )}
              {tool === "profile" && <SocialProfile />}
              {tool === "proposal" && <ProposalEditor />}
              {tool === "images" && <ImageLibrary />}
              {tool === "calendar" && (
                <>
                  <Calendar />
                  <ConnectionStatus calendarOnly readOnly />
                </>
              )}
              {tool === "landing" && <LandingBuilder wizard={new URLSearchParams(window.location.search).get("wizard") === "1"} />}
              {tool === "bookings" && (
                <>
                  <Bookings />
                </>
              )}
              {tool === "analytics" && (
                <>
                  {embedded ? <SharedAreaAnalytics project={project} /> : <Analytics completed={completed} total={tasks.length} />}
                </>
              )}
              {tool === "automation" && (
                <>
                  <Automation />
                </>
              )}
              {tool === "assistant" && (
                <ContextAssistant currentTool="Hoy" currentTask={nextTask} />
              )}
            </Suspense>
          </>
        )}
      </main>
      {menu && (
        <div className="hoy-menu-backdrop">
          <aside
            ref={menuRef}
            className="hoy-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hoy-menu-title"
          >
            <DSButtonSecondary
              autoFocus
              className="hoy-close"
              aria-label="Cerrar menú"
              onClick={() => setMenu(false)}
            >
              <X size={20} />
            </DSButtonSecondary>
            <h2 id="hoy-menu-title">
              {menuPage === "root"
                ? "A tu ritmo"
                : menuPage === "rhythm"
                  ? "Mi ritmo"
                  : menuPage === "account"
                    ? "Mi espacio"
                    : "Herramientas"}
            </h2>
            {menuPage !== "root" && (
              <DSButtonSecondary
                className="hoy-menu-back"
                onClick={() => setMenuPage("root")}
              >
                ← Volver
              </DSButtonSecondary>
            )}
            <nav className="hoy-menu-options">
              {menuPage === "root" && (
                <>
                  <DSButtonSecondary onClick={() => setMenuPage("tools")}>
                    Herramientas
                  </DSButtonSecondary>
                  <DSButtonSecondary onClick={() => setMenuPage("rhythm")}>
                    Mi ritmo
                  </DSButtonSecondary>
                  <DSButtonSecondary onClick={() => setMenuPage("account")}>
                    Mi espacio
                  </DSButtonSecondary>
                </>
              )}
              {menuPage === "tools" && (
                <>
                  <DSButtonSecondary onClick={() => setMenuPage("create")}>
                    Crear contenido
                  </DSButtonSecondary>
                  <DSButtonSecondary onClick={() => setMenuPage("manage")}>
                    Gestionar mi negocio
                  </DSButtonSecondary>
                  <DSButtonSecondary onClick={() => setMenuPage("plan")}>
                    Organizarme y pedir ayuda
                  </DSButtonSecondary>
                </>
              )}
              {menuPage === "create" && (
                <>
                  {group(["content", "images"])}
                  <DSButtonSecondary onClick={() => setMenuPage("video")}>
                    Grabar o editar video
                  </DSButtonSecondary>
                </>
              )}
              {menuPage === "video" && group(["teleprompter", "video"])}
              {menuPage === "manage" &&
                group(["landing", "bookings", "automation"])}
              {menuPage === "plan" &&
                group(["calendar", "analytics", "assistant"])}
              {menuPage === "account" && (
                <>
                  <DSButtonSecondary
                    onClick={() => {
                      setPage("templates");
                      setMenu(false);
                    }}
                  >
                    Plantillas de mi rubro
                  </DSButtonSecondary>
                  {onBack ? (
                    <DSButtonSecondary onClick={onBack}>Mis proyectos</DSButtonSecondary>
                  ) : (
                    <Link to="/login">Iniciar sesión</Link>
                  )}
                  {!demo && (
                    <DSButtonSecondary
                      onClick={async () => {
                        await signOut();
                        window.location.assign("/login");
                      }}
                    >
                      Salir de mi cuenta
                    </DSButtonSecondary>
                  )}
                </>
              )}
            </nav>
            {menuPage === "rhythm" && (
              <div className="hoy-rhythm-settings">
                <label>
                  ¿Cómo quieres avanzar?
                  <select
                    aria-label="Mi ritmo"
                    value={state}
                    onChange={(event) => {
                      chooseState(event.target.value as FocusState);
                      setMenu(false);
                    }}
                  >
                    <option value="focused">A mi ritmo</option>
                    <option value="exhausted">Solo cinco minutos</option>
                    <option value="anxious">Una cosa a la vez</option>
                    <option value="low-motivation">Pasos pequeños</option>
                    <option value="high-energy">Tengo energía</option>
                    <option value="confused">Quiero orientación</option>
                  </select>
                </label>
                <label>
                  <DSInput
                    type="checkbox"
                    checked={adaptive}
                    onChange={(event) => setAdaptive(event.target.checked)}
                  />{" "}
                  Adaptar con mi actividad
                </label>
                <p>Puedes cambiarlo cuando quieras.</p>
              </div>
            )}
            <small>
              {demo
                ? "Espacio de prueba"
                : user?.user_metadata?.display_name || business.name}
            </small>
          </aside>
        </div>
      )}
      {chatOpen && (
        <aside
          className="tk-chat-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Asistente contextual"
        >
          <DSButtonSecondary
            className="tk-drawer-close"
            aria-label="Cerrar ayuda"
            onClick={() => setChatOpen(false)}
          >
            <X size={20} />
          </DSButtonSecondary>
          <Suspense fallback={<p>Cargando ayuda…</p>}>
            <ContextAssistant
              currentTool={current?.name ?? "Hoy"}
              currentTask={nextTask}
            />
          </Suspense>
        </aside>
      )}
    </div>
  );
}

function SharedAreaAnalytics({ project }: { project: ForUActiveProject }) {
  const { entry } = useAreaDocuments(project.id, projectModuleType(project) ?? 'restaurant');
  const tasks = entry?.tasks?.tasks ?? [];
  return <Analytics completed={tasks.filter(task => task.done).length} total={tasks.length} proUnlocked={savedAreaAchievement(entry)} />;
}
