import {writeRevisionDocument} from '../services/revisionDocuments';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";
import {
  detectState,
  learnPatterns,
  type BehaviorAction,
  type BehaviorMetrics,
  type FocusState,
} from "./engine";
import { MediaScope } from '../components/shared/mediaScope';
import type { Business } from "./types";

type ToolkitContextValue = {
  userId: string;
  projectId: string;
  business: Business;
  demo: boolean;
  loading: boolean;
  loadError: boolean;
  docs: Record<string, unknown>;
  status: string;
  state: FocusState;
  reportCompletion: (rate: number) => void;
  adaptive: boolean;
  actions: BehaviorAction[];
  hint: string;
  setHint: (hint: string) => void;
  save: (kind: string, value: unknown) => Promise<void>;
  reload: () => Promise<void>;
  documentRevision: (kind: string) => string | null;
  track: (
    type: string,
    completed?: boolean,
    duration?: number,
    expectedSeconds?: number,
  ) => void;
  setAdaptive: (enabled: boolean) => void;
  chooseState: (state: FocusState) => void;
};
const Context = createContext<ToolkitContextValue | null>(null);
// A provider and its typed hook share a single context identity.
// eslint-disable-next-line react-refresh/only-export-components
export function useToolkit() {
  const context = useContext(Context);
  if (!context) throw new Error("Falta el contexto de herramientas.");
  return context;
}
const initialMetrics = (): BehaviorMetrics => ({
  lastActionTime: Date.now(),
  completionRate: 0,
  helpClicks: [],
  skipped: 0,
  fastTasks: 0,
  scrollDepth: 0,
  mouseMovement: 0,
  timeOnTask: 0,
});

// The parent keys this provider by account + project. Requests cannot hydrate a different tenant.
export function ToolkitProvider({
  children,
  userId,
  projectId,
  business,
  demo = false,
}: {
  children: ReactNode;
  userId: string;
  projectId: string;
  business: Business;
  demo?: boolean;
}) {
  const [docs, setDocs] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(!demo);
  const [loadError, setLoadError] = useState(false);
  const [status, setStatus] = useState(
    demo
      ? "Prueba · los cambios duran esta sesión"
      : "Cargando tus herramientas…",
  );
  const [state, setState] = useState<FocusState>("focused");
  const [adaptive, setAdaptiveValue] = useState(true);
  const [actions, setActions] = useState<BehaviorAction[]>([]);
  const [hint, setHint] = useState("");
  const metrics = useRef(initialMetrics());
  const actionsRef = useRef<BehaviorAction[]>([]);
  const manual = useRef<FocusState | null>(null);
  const mounted = useRef(true);
  const lastIntervention = useRef(0);
  const shown = useRef(new Set<string>());
  const queues = useRef(new Map<string, Promise<void>>());
  const revisions = useRef(new Map<string, string>());
  const documentsReady = useRef(demo);
  const epoch=useRef(0);

  const reload = useCallback(async () => {
    if (demo) return;
    if (!supabase) {
      setLoadError(true);
      setStatus("Conecta tu cuenta para guardar tus herramientas.");
      setLoading(false);
      return;
    }
    const generation=++epoch.current;documentsReady.current=false;
    setLoading(true);
    try {
    const [documents, history, preferences] = await Promise.all([
      supabase
        .from("toolkit_documents")
        .select("kind,payload,updated_at")
        .eq("user_id", userId)
        .eq("project_id", projectId),
      supabase
        .from("user_actions")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(200),
      supabase
        .from("user_preferences")
        .select("adaptive_enabled")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    if (!mounted.current||generation!==epoch.current) return;
    documentsReady.current = !documents.error;
    setLoadError(Boolean(documents.error));
    if (documents.error)
      setStatus(
        "No pudimos cargar la nube. Reintenta para guardar tus cambios.",
      );
    else {
      revisions.current = new Map((documents.data ?? []).map(row => [row.kind, row.updated_at]));
      setDocs(
        Object.fromEntries(
          (documents.data ?? []).map((row) => [row.kind, row.payload]),
        ),
      );
      setStatus("Conectado · guarda cada cambio con su botón");
    }
    if (history.data) {
      const loaded: BehaviorAction[] = history.data.map((row) => ({
        id: row.id,
        type: row.action_type,
        at: Date.parse(row.timestamp),
        duration: row.duration ?? 0,
        completed: row.completed,
      }));
      actionsRef.current = loaded;
      setActions(loaded);
    }
    if (preferences.data) setAdaptiveValue(preferences.data.adaptive_enabled);
    } catch {
      if(mounted.current&&generation===epoch.current){documentsReady.current=false;setLoadError(true);setStatus('No se pudo consultar la nube. Reintenta antes de editar.');}
    } finally {if(mounted.current&&generation===epoch.current)setLoading(false);}
  }, [demo, projectId, userId]);

  // Subscribe to the authenticated remote documents for this provider instance.
  useEffect(() => {
    mounted.current = true;
    // Synchronize the view with its external data or media resource.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
    return () => {
      mounted.current = false;
    };
  }, [reload]);

  const save = useCallback(
    async (kind: string, value: unknown) => {
      if (demo) {
        setDocs((previous) => ({ ...previous, [kind]: value }));
        return;
      }
      if (!supabase) throw new Error("Conecta tu cuenta para guardar.");
      if (!documentsReady.current) throw new Error('No se cargaron los datos guardados. Recarga antes de editar para no sobrescribirlos.');
      const client = supabase;
      const generation=epoch.current;
      const previous = queues.current.get(kind) ?? Promise.resolve();
      const pending = previous
        .catch(() => {})
        .then(async () => {
          if(generation!==epoch.current||!documentsReady.current||!mounted.current)throw new Error('La herramienta se recuperó o cerró. No se guardó la edición anterior.');
          const revision = revisions.current.get(kind) ?? null;
          const updatedRevision=await writeRevisionDocument(client,userId,projectId,kind,value,revision);
          if (mounted.current && generation===epoch.current) {
            revisions.current.set(kind, updatedRevision);
            setDocs((current) => ({ ...current, [kind]: value }));
            setStatus("Guardado en tu cuenta");
          }
        });
      queues.current.set(kind, pending);
      await pending;
    },
    [demo, projectId, userId],
  );

  const track = useCallback(
    (type: string, completed = true, duration = 0, expectedSeconds = 300) => {
      const action: BehaviorAction = {
        id: crypto.randomUUID(),
        type,
        at: Date.now(),
        duration: Math.max(0, Math.round(duration)),
        completed,
        expectedSeconds,
      };
      const m = metrics.current;
      m.lastActionTime = action.at;
      m.scrollDepth = 0;
      m.mouseMovement = 0;
      if (type === "help")
        m.helpClicks = [
          ...m.helpClicks.filter((t) => action.at - t < 60_000),
          action.at,
        ];
      else {
        m.skipped = completed ? 0 : m.skipped + 1;
        m.fastTasks =
          completed && duration > 0 && duration < expectedSeconds * 0.6
            ? m.fastTasks + 1
            : 0;
      }
      actionsRef.current = [action, ...actionsRef.current].slice(0, 200);
      setActions(actionsRef.current);
      const tasks = actionsRef.current.filter((a) => a.type !== "help");
      m.completionRate = tasks.length
        ? tasks.filter((a) => a.completed).length / tasks.length
        : 0;
      if (!demo && supabase) {
        void supabase
          .from("user_actions")
          .insert({
            id: action.id,
            user_id: userId,
            action_type: type,
            duration: action.duration,
            completed,
            metadata: { project_id: projectId },
          })
          .then(({ error }) => {
            if (error && mounted.current)
              setStatus(
                "Tu actividad no se sincronizó; tus borradores se guardan por separado.",
              );
          });
        const patterns = learnPatterns(actionsRef.current);
        if (patterns.sampleSize >= 3)
          void supabase.from("user_preferences").upsert(
            {
              user_id: userId,
              preferred_time_of_day:
                patterns.preferredHour === null
                  ? null
                  : String(patterns.preferredHour),
              preferred_task_duration: patterns.averageSeconds,
              preferred_content_format: patterns.preferredType,
            },
            { onConflict: "user_id" },
          );
      }
    },
    [demo, projectId, userId],
  );

  useEffect(() => {
    const activity = () => {
      metrics.current.lastActionTime = Date.now();
      metrics.current.scrollDepth = 0;
      metrics.current.mouseMovement = 0;
    };
    const move = () => {
      metrics.current.mouseMovement++;
    };
    const scroll = (event: Event) => {
      const target =
        event.target instanceof HTMLElement
          ? event.target
          : document.documentElement;
      const distance = target.scrollHeight - target.clientHeight;
      metrics.current.scrollDepth =
        distance > 0 ? (100 * target.scrollTop) / distance : 0;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", activity, { passive: true });
    document.addEventListener("keydown", activity);
    document.addEventListener("scroll", scroll, {
      passive: true,
      capture: true,
    });
    const id = window.setInterval(() => {
      if (document.hidden || !adaptive) return;
      const next = manual.current ?? detectState(metrics.current);
      setState(next);
      const completion = metrics.current.completionRate;
      const milestone = completion >= 1 ? "100" : completion >= 0.5 ? "50" : "";
      const key =
        milestone &&
        actionsRef.current.filter((a) => a.type !== "help").length >= 2 &&
        !shown.current.has(milestone)
          ? milestone
          : next;
      if (
        key !== "focused" &&
        !shown.current.has(key) &&
        Date.now() - lastIntervention.current > 5 * 60_000
      ) {
        shown.current.add(key);
        lastIntervention.current = Date.now();
        setHint(
          key === "100" || key === "50"
            ? "¡Bien hecho! Estás completando los pasos que empiezas."
            : "¿Te ayudaría un paso más pequeño? Puedes cambiar el ritmo arriba.",
        );
        if (!demo && supabase)
          void supabase.from("ai_interventions").insert({
            user_id: userId,
            intervention_type: key,
            metadata: { project_id: projectId },
          });
      }
    }, 5000);
    return () => {
      clearInterval(id);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", activity);
      document.removeEventListener("keydown", activity);
      document.removeEventListener("scroll", scroll, true);
    };
  }, [adaptive, demo, projectId, userId]);
  function setAdaptive(enabled: boolean) {
    setAdaptiveValue(enabled);
    if (!enabled) setState("focused");
    if (!demo && supabase)
      void supabase
        .from("user_preferences")
        .upsert(
          { user_id: userId, adaptive_enabled: enabled },
          { onConflict: "user_id" },
        )
        .then(({ error }) => {
          if (error) setStatus("No se guardó tu preferencia de adaptación.");
        });
  }
  const reportCompletion = useCallback((rate: number) => {
    metrics.current.completionRate = Math.max(0, Math.min(1, rate));
  }, []);
  return (
    <Context.Provider
      value={{
        userId,
        projectId,
        business,
        demo,
        loading,
        loadError,
        docs,
        status,
        state,
        reportCompletion,
        adaptive,
        actions,
        hint,
        setHint,
        save,
        reload,
        documentRevision: kind => revisions.current.get(kind) ?? null,
        track,
        setAdaptive,
        chooseState: (next) => {
          manual.current = next === "focused" ? null : next;
          setState(next);
        },
      }}
    >
      <MediaScope.Provider value={{ userId, projectId }}>{children}</MediaScope.Provider>
    </Context.Provider>
  );
}
