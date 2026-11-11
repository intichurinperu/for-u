import { Card as DSCard, Select as DSSelect } from '../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary } from '../components/ui/DesignSystem';
import { useState } from "react";
import { businessTemplates } from "../data/templates";
import { useToolkit } from "./ToolkitContext";
import { downloadBlob } from "./api";
export default function TemplateLibrary() {
  const { business } = useToolkit();
  const [key, setKey] = useState(
    businessTemplates.find((t) => t.key === business.industry)?.key ??
      "services",
  );
  const template = businessTemplates.find((t) => t.key === key)!;
  return (
    <DSCard as="section" className="tk-card tk-stack">
      <h2>Una ruta para tu rubro</h2>
      <DSSelect label="Rubro de la guía" info="Consulta una guía de trabajo. Elegir otra guía no cambia el rubro ni los datos del proyecto."
          value={key}
          onChange={(e) => setKey(e.target.value as typeof key)}
        >
          {businessTemplates.map((t) => (
            <option key={t.key} value={t.key}>
              {t.name}
            </option>
          ))}
        </DSSelect>
      <p>
        <strong>Entrada de venta:</strong> {template.entry}
      </p>
      <p>
        Úsala al crear un proyecto para tener las subtareas en tu Ruta Digital.
        Las plataformas externas se configuran en sus propias cuentas.
      </p>
      {template.steps.map((step, index) => (
        <details key={step.id}>
          <summary>
            {index + 1}. {step.title}
          </summary>
          <ol>
            {step.tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ol>
          <p>
            <strong>Herramientas:</strong> {step.tools.join(" · ")}
          </p>
          <p>{step.tip}</p>
          <p>
            <strong>Ejemplo ilustrativo:</strong> {step.example}
          </p>
          <DSButtonSecondary
            tooltip="Descarga una hoja de trabajo en formato Markdown para este paso."
            onClick={() =>
              downloadBlob(
                new Blob([step.resource.content], {
                  type: "text/markdown;charset=utf-8",
                }),
                step.resource.name,
              )
            }
          >
            Descargar hoja de {step.title.toLowerCase()}
          </DSButtonSecondary>
        </details>
      ))}
    </DSCard>
  );
}
