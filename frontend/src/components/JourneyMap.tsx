import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import type { ForUActiveProject } from "../stores/useActiveProjectsStore";

export type JourneyStep = {
  id: string;
  title: string;
  description: string;
  nodeId?: string;
  complete: boolean;
};
const phases = [
  ["Empatizar", "Escucha a las personas que quieres atender."],
  ["Definir", "Elige la necesidad que tu negocio puede resolver."],
  ["Idear", "Explora formas concretas de presentar tu propuesta."],
  ["Prototipar", "Crea una versión pequeña que puedas mostrar."],
  ["Probar", "Recoge respuestas y mejora con evidencia."],
];
export function projectJourney(project: ForUActiveProject): JourneyStep[] {
  return phases.map(([title, description], i) => {
    const route = project.digitalRoute[i];
    const node = project.nodes.find((n) => n.id === route?.linkedNodeId);
    return {
      id: route?.id ?? "phase-" + i,
      title,
      description: route?.title ?? description,
      nodeId: node?.id,
      complete: Boolean(
        route?.completedAt || node?.completedAt || node?.taskStatus === "done",
      ),
    };
  });
}
export default function JourneyMap({
  steps,
  onSelect,
}: {
  steps: JourneyStep[];
  onSelect: (step: JourneyStep) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const [lines, setLines] = useState<{
    d: string;
    width: number;
    height: number;
  }>({ d: "", width: 1, height: 1 });
  const [selected, setSelected] = useState<string | null>(null);
  const current = steps.find((step) => !step.complete)?.id;
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let frame = 0;
    const draw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const parent = element.getBoundingClientRect();
        const points = nodes.current
          .filter((node): node is HTMLButtonElement => Boolean(node))
          .map((node) => {
            const box = node.getBoundingClientRect();
            return {
              x: box.left - parent.left + box.width / 2,
              y: box.top - parent.top + box.height / 2,
            };
          });
        const d = points
          .map((p, i) =>
            i === 0 ? "M " + p.x + " " + p.y : "L " + p.x + " " + p.y,
          )
          .join(" ");
        setLines({ d, width: parent.width, height: parent.height });
      });
    };
    const observer = new ResizeObserver(draw);
    observer.observe(element);
    nodes.current.forEach((node) => {
      if (node) observer.observe(node);
    });
    window.addEventListener("resize", draw);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [steps]);
  return (
    <section
      className="foru-journey"
      aria-label="Mapa de cinco pasos de Design Thinking"
    >
      <header>
        <span>RUTA DIGITAL</span>
        <h1>Tu siguiente paso</h1>
        <p>Abre el punto actual cuando quieras continuar.</p>
      </header>
      <div ref={container} className="foru-journey-map">
        <svg
          className="foru-journey-lines"
          viewBox={"0 0 " + lines.width + " " + lines.height}
          aria-hidden="true"
        >
          <path d={lines.d} pathLength="1" />
        </svg>
        {steps.slice(0, 5).map((step, index) => (
          <DSButtonSecondary
            key={step.id}
            ref={(element) => {
              nodes.current[index] = element;
            }}
            className={
              "foru-journey-node" +
              (step.id === current ? " is-active" : "") +
              (step.complete ? " is-complete" : "")
            }
            style={{ "--step": index } as CSSProperties}
            aria-pressed={selected === step.id}
            aria-label={step.id===current?'Abrir paso actual: '+step.title:'Paso '+(index+1)+(step.complete?' completado':' pendiente')}
            disabled={step.id!==current}
            onClick={() => {
              setSelected(step.id);
              onSelect(step);
            }}
          >
            <span className="foru-journey-number">
              {step.complete ? <Check size={20} /> : "0" + (index + 1)}
            </span>

          </DSButtonSecondary>
        ))}
      </div>
    </section>
  );
}
export function JourneyMapDemo() {
  const [selected, setSelected] = useState<JourneyStep | null>(null);
  const steps = phases.map(([title, description], i) => ({
    id: String(i),
    title,
    description,
    complete: i === 0,
  }));
  return (
    <main>
      <JourneyMap steps={steps} onSelect={setSelected} />
      {selected && (
        <aside className="foru-journey-panel" aria-label="Detalles del paso">
          <DSButtonSecondary onClick={() => setSelected(null)} aria-label="Cerrar paso">
            ×
          </DSButtonSecondary>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <p>
            Vista de prueba. En tu proyecto encontrarás las subtareas de tu
            rubro.
          </p>
        </aside>
      )}
    </main>
  );
}
