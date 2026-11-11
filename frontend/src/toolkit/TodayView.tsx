import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../components/ui/DesignSystem';
import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  useActiveProjectsStore,
  type ForUActiveProject,
} from "../stores/useActiveProjectsStore";
import { useToolkit } from "./ToolkitContext";
import { todayRoute, type TodayProgress } from "./todayModel";
import { localDate } from "./engine";
import type { CalendarEntry } from "./types";
import { useDialogFocus } from "./useDialogFocus";
import { downloadBlob } from "./api";
export default function TodayView({
  project,
  onHelp,
}: {
  project: ForUActiveProject;
  onHelp: () => void;
}) {
  const { user } = useAuth();
  const { state, docs, save, demo, track, reportCompletion } = useToolkit();
  const progress = (docs.today as TodayProgress | undefined) ?? {
    completed: [],
  };
  const route = todayRoute(project, progress);
  const [panelStep, setPanelStep] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [notes, setNotes] = useState(progress.notes ?? {});
  const closeButton = useRef<HTMLButtonElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const panel = panelStep === null ? null : route.steps[panelStep];
  const exhausted = state === "exhausted",
    anxious = state === "anxious";
  const panelRef = useRef<HTMLElement>(null);
  const taskStarted = useRef(0);
  useEffect(() => {
    if (panelStep !== null) taskStarted.current = Date.now();
  }, [panelStep]);
  useDialogFocus(panelRef, panelStep !== null, () => setPanelStep(null));
  useEffect(() => {
    reportCompletion(route.percentage / 100);
  }, [route.percentage, reportCompletion]);
  async function toggle(
    id: string,
    done: boolean,
    title: string,
    nodeId: string | undefined,
    actionTime: number,
  ) {
    setBusy(true);
    setNotice("");
    try {
      const completed = done
        ? [...new Set([...progress.completed, id])]
        : progress.completed.filter((item) => item !== id);
      const pending = done
        ? (progress.pending ?? []).filter((item) => item !== id)
        : [...new Set([...(progress.pending ?? []), id])];
      await save("today", { ...progress, completed, pending, notes });
      if (!demo) {
        const store = useActiveProjectsStore.getState();
        if (!nodeId && panel) {
          store.createTasksForDigitalRouteStep(project.id, panel.id);
          nodeId = store
            .getProjectById(project.id)
            ?.nodes.find((node) => node.title === title)?.id;
        }
        if (nodeId)
          store.updateNode(project.id, nodeId, {
            taskStatus: done ? "done" : "todo",
            completedAt: done ? new Date().toISOString() : undefined,
          });
      }
      if (done) {
        track(
          "task",
          true,
          Math.max(1, (actionTime - taskStarted.current) / 1000),
          900,
        );
        taskStarted.current = actionTime;
      }
      setNotice(
        done ? "Un paso más. Bien hecho." : "Tarea pendiente de nuevo.",
      );
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function closePanel() {
    setPanelStep(null);
    startButton.current?.focus();
  }
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });
  const entries = (docs.calendar as CalendarEntry[] | undefined) ?? [];
  return (
    <>
      <section
        className={"hoy-view hoy-" + state}
        aria-label="Hoy"
        inert={Boolean(panel)}
      >
        {exhausted ? (
          <DSButtonSecondary
            ref={startButton}
            className="hoy-action-btn hoy-only-action"
            onClick={() => setPanelStep(route.current.index)}
          >
            <span>Solo 5 minutos. Te lo prometo.</span>
            <strong>Empezar ahora</strong>
          </DSButtonSecondary>
        ) : (
          <>
            {!anxious && (
              <p className="hoy-greeting">
                Hola,{" "}
                {user?.user_metadata?.display_name?.split(" ")[0] ||
                  "emprendedora"}
              </p>
            )}
            <div className="hoy-task">
              {!anxious && (
                <p className="hoy-step-label">
                  {route.finished
                    ? "Tu ruta está completa"
                    : "Paso " +
                      (route.current.index + 1) +
                      " de 5 · " +
                      route.current.title}
                </p>
              )}
              {anxious && (
                <p className="hoy-state-message">Respira. Una cosa a la vez.</p>
              )}
              <h1>
                {route.finished
                  ? "Date un momento para ver lo que lograste."
                  : route.task.title}
              </h1>
              {!anxious && (
                <p className="hoy-description">
                  {state === "low-motivation"
                    ? "Empieza con 90 segundos."
                    : route.finished
                      ? "Puedes revisar tus notas cuando quieras."
                      : "Tiempo estimado: " + route.task.minutes + " minutos"}
                </p>
              )}
            </div>
            <DSButtonSecondary
              ref={startButton}
              className="hoy-action-btn"
              onClick={() => setPanelStep(route.current.index)}
            >
              {route.finished ? "Revisar mi trabajo" : "Empezar ahora"}{" "}
              <span aria-hidden="true">→</span>
            </DSButtonSecondary>
            {!anxious && state !== "low-motivation" && (
              <div className="hoy-progress">
                <progress
                  max={100}
                  value={route.percentage}
                  aria-label="Progreso de tu ruta"
                />
                <span>✨ {route.percentage}% de tu ruta</span>
              </div>
            )}
            {!anxious && state !== "low-motivation" && (
              <nav
                className="hoy-route-dots"
                aria-label="Progreso en cinco pasos"
              >
                {route.steps.map((step) => (
                  <span key={step.id} className="hoy-dot-wrap">
                    {step.index === route.current.index && !route.finished ? (
                      <DSButtonSecondary
                        className="hoy-dot is-current"
                        onClick={() => setPanelStep(step.index)}
                        aria-label={"Abrir paso actual: " + step.title}
                        aria-current="step"
                      >
                        ●
                      </DSButtonSecondary>
                    ) : (
                      <span
                        className={"hoy-dot" + (step.done ? " is-done" : "")}
                        aria-label={
                          "Paso " +
                          (step.index + 1) +
                          (step.done ? " completado" : " pendiente")
                        }
                      >
                        {step.done ? <Check size={14} /> : "○"}
                      </span>
                    )}
                    <small aria-hidden="true">{step.index + 1}</small>
                  </span>
                ))}
              </nav>
            )}
            {state === "low-motivation" && (
              <div className="hoy-micro">
                <p>
                  <span className="hoy-fire" aria-hidden="true">
                    🔥
                  </span>{" "}
                  Una micro-racha para empezar
                </p>
                {[
                  "Anota qué quieres resolver",
                  "Escribe una primera idea",
                  "Añade un ejemplo de tu negocio",
                ].map((title, index) => {
                  const id = route.task.id + "/micro/" + index;
                  return (
                    <label key={id}>
                      <DSInput
                        type="checkbox"
                        checked={progress.micro?.includes(id) ?? false}
                        disabled={busy}
                        onChange={async (e) => {
                          setBusy(true);
                          const micro = e.target.checked
                            ? [...(progress.micro ?? []), id]
                            : (progress.micro ?? []).filter(
                                (key) => key !== id,
                              );
                          try {
                            await save("today", { ...progress, micro, notes });
                          } catch (error) {
                            setNotice((error as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      />
                      <span>{title}</span>
                      <small>90 s</small>
                    </label>
                  );
                })}
              </div>
            )}
            {state === "high-energy" && (
              <section className="hoy-week" aria-label="Tu semana">
                <h2>Tu semana, a tu ritmo</h2>
                <ol>
                  {days.map((date) => {
                    const items = entries.filter(
                      (entry) => entry.date === localDate(date),
                    );
                    return (
                      <li key={localDate(date)}>
                        <strong>
                          {date.toLocaleDateString("es-PE", {
                            weekday: "short",
                            day: "numeric",
                          })}
                        </strong>
                        <span>
                          {items.length
                            ? items[0].title +
                              (items.length > 1
                                ? " · +" + (items.length - 1)
                                : "")
                            : "Espacio libre"}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
            {state === "confused" && (
              <p className="hoy-state-message">
                Al empezar, verás un ejemplo y una tarea a la vez.
              </p>
            )}
          </>
        )}
        {notice && <p role="status">{notice}</p>}
      </section>
      {panel && (
        <div className="hoy-panel-backdrop">
          <section
            ref={panelRef}
            className="hoy-step-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hoy-panel-title"
          >
            <DSButtonSecondary
              ref={closeButton}
              className="hoy-close"
              aria-label="Cerrar paso"
              onClick={closePanel}
            >
              <X size={20} />
            </DSButtonSecondary>
            <p className="hoy-step-label">Paso {panel.index + 1} de 5</p>
            <h2 id="hoy-panel-title">{panel.title}</h2>
            <p>{panel.tip}</p>
            <div className="hoy-panel-progress">
              <progress
                aria-label="Progreso del paso"
                value={panel.tasks.filter((task) => task.done).length}
                max={panel.tasks.length}
              />
              <small>
                {panel.tasks.filter((task) => task.done).length} de{" "}
                {panel.tasks.length} tareas
              </small>
            </div>
            <div className="hoy-subtasks">
              {panel.tasks
                .filter(
                  (task) =>
                    (!anxious && !exhausted) ||
                    task.id ===
                      (panel.tasks.find((item) => !item.done) ?? panel.tasks[0])
                        .id,
                )
                .map((task) => (
                  <label key={task.id}>
                    <DSInput
                      type="checkbox"
                      checked={task.done}
                      disabled={busy}
                      onChange={(e) =>
                        void toggle(
                          task.id,
                          e.target.checked,
                          task.title,
                          task.nodeId,
                          Date.now(),
                        )
                      }
                    />
                    <span>{task.title}</span>
                    <small>
                      {exhausted ? "5 min para empezar" : task.minutes + " min"}
                    </small>
                  </label>
                ))}
            </div>
            <label className="hoy-notes">
              Tu primera respuesta
              <DSTextarea
                value={notes[panel.id] ?? ""}
                maxLength={4000}
                rows={4}
                onChange={(e) =>
                  setNotes({ ...notes, [panel.id]: e.target.value })
                }
                placeholder="Puedes empezar con una frase."
              />
            </label>
            <DSButtonSecondary
              className="hoy-save-note"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await save("today", { ...progress, notes });
                  setNotice("Tu respuesta está guardada.");
                } catch (error) {
                  setNotice((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Guardar mi respuesta
            </DSButtonSecondary>
            <DSButtonSecondary
              className="hoy-action-btn"
              disabled={!panel.done || busy}
              onClick={closePanel}
            >
              {panel.done
                ? route.finished
                  ? "Volver a Hoy"
                  : "Continuar al siguiente paso"
                : "Completa las tareas para avanzar"}
            </DSButtonSecondary>
            <details>
              <summary>Ver un ejemplo o pedir ayuda</summary>
              <p>{panel.example}</p>
              <DSButtonSecondary
                onClick={() => {
                  track(
                    "task",
                    false,
                    Math.max(1, (Date.now() - taskStarted.current) / 1000),
                    900,
                  );
                  closePanel();
                }}
              >
                Dejar para después
              </DSButtonSecondary>
              <DSButtonSecondary
                onClick={() =>
                  downloadBlob(
                    new Blob([panel.resource.content], {
                      type: "text/markdown;charset=utf-8",
                    }),
                    panel.resource.name,
                  )
                }
              >
                Descargar hoja de trabajo
              </DSButtonSecondary>
              <DSButtonSecondary
                onClick={() => {
                  track("help");
                  closePanel();
                  onHelp();
                }}
              >
                Pedir ayuda
              </DSButtonSecondary>
            </details>
            {notice && <p role="status">{notice}</p>}
          </section>
        </div>
      )}
    </>
  );
}
