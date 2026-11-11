import { Card as DSCard } from './ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { downloadBlob } from '../toolkit/api';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { ForUActiveProject } from '../stores/useActiveProjectsStore';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { getDigitalRouteTemplate } from '../templates/digitalRouteTemplates';
import { useRewardBurst, type RewardKey } from '../hooks/useRewardBurst';
import MagicBadge from './ui/MagicBadge';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';

type DigitalRouteViewProps = {
  project: ForUActiveProject | null;
  onOpenLanding: () => void;
  onOpenTasks: () => void;
  onStartAction: () => void;
};

export default function DigitalRouteView({
  project,
  onOpenLanding,
  onOpenTasks,
  onStartAction,
}: DigitalRouteViewProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const getDigitalRouteSteps = useActiveProjectsStore((state) => state.getDigitalRouteSteps);
  const getCurrentDigitalRouteStep = useActiveProjectsStore((state) => state.getCurrentDigitalRouteStep);
  const createTasksForDigitalRouteStep = useActiveProjectsStore((state) => state.createTasksForDigitalRouteStep);
  const completeDigitalRouteStep = useActiveProjectsStore((state) => state.completeDigitalRouteStep);
  const reward = useRewardBurst();

  // Map step index to reward key
  const stepRewardKeys: RewardKey[] = ['station1Complete', 'station2Complete', 'station3Complete', 'station4Complete', 'station5Complete'];

  const routeTemplate = useMemo(() => getDigitalRouteTemplate(project?.industryKey), [project?.industryKey]);
  const steps = project ? getDigitalRouteSteps(project.id) : [];
  const currentStep = project ? getCurrentDigitalRouteStep(project.id) : null;
  const activeStep = steps.find((step) => step.id === selectedStepId) ?? currentStep;
  const readySteps = steps.filter((step) => step.status === 'ready').length;
  const progress = steps.length ? Math.round((readySteps / steps.length) * 100) : 0;

  if (!project) {
    return (
      <section className="foru-digital-route-view">
        <MagicCard className="foru-digital-route-empty">
          <MagicBadge>Ruta Digital</MagicBadge>
          <h1>Elige un proyecto para ver su ruta.</h1>
        </MagicCard>
      </section>
    );
  }

  function handlePrimaryAction(stepId: string) {
    if (!project) return;
    const step = steps.find((item) => item.id === stepId);
    if (!step) return;

    if (step.id === 'landing') {
      createTasksForDigitalRouteStep(project.id, step.id);
      onOpenLanding();
      return;
    }

    const createdIds = createTasksForDigitalRouteStep(project.id, step.id);
    if (createdIds.length > 0) {
      toast.success(`Creé ${createdIds.length} acciones para ${step.shortTitle}.`);
    } else {
      toast('Esta estación ya tiene sus acciones creadas.');
    }
    onStartAction();
  }

  function handleOpenStep(stepId: string) {
    setSelectedStepId(stepId);
  }

  function handleCompleteStep(stepId: string) {
    if (!project) return;
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    const completed = completeDigitalRouteStep(project.id, stepId);
    if (completed) {
      const rewardKey = stepRewardKeys[stepIndex] ?? 'station1Complete';
      reward.trigger(rewardKey);
      toast.success('Estación lista. Avanzamos la ruta ✨');
    }
  }

  return (
    <section className="foru-digital-route-view" aria-label="Ruta Digital del proyecto">
      <header className="foru-digital-route-hero">
        <div>
          <MagicBadge>{routeTemplate.title}</MagicBadge>
          <h1>{project.name}</h1>
          <p>{routeTemplate.description}</p>
        </div>
        <DSCard as="div" className="foru-digital-route-progress-card">
          <span>{progress}%</span>
          <strong>{readySteps}/{steps.length} estaciones listas</strong>
          <i><b style={{ width: `${progress}%` }} /></i>
        </DSCard>
      </header>

      {currentStep ? (
        <MagicCard className="foru-digital-route-current" as="section">
          <div>
            <MagicBadge>Esto toca ahora</MagicBadge>
            <h2>{currentStep.title}</h2>
            <p>{currentStep.outcome}</p>
            <small>{currentStep.why}</small>
          </div>
          <div className="foru-digital-route-current-actions">
            <MagicButton type="button" variant="soft" onClick={() => handlePrimaryAction(currentStep.id)}>
              {currentStep.primaryAction}
            </MagicButton>
            <MagicButton type="button" variant="soft" onClick={() => handleOpenStep(currentStep.id)}>
              Ver guía
            </MagicButton>
          </div>
        </MagicCard>
      ) : null}

      <div className="foru-digital-route-workspace">
        <div className="foru-digital-route-path">
          {steps.map((step, index) => (
            <MagicCard
              key={step.id}
              as="article"
              className={`foru-digital-route-step is-${step.status} is-priority-${step.priority} ${currentStep?.id === step.id ? 'is-current' : ''} ${activeStep?.id === step.id ? 'is-selected' : ''}`}
            >
              <DSButtonSecondary
                type="button"
                className="foru-digital-route-step-marker"
                onClick={() => handleOpenStep(step.id)}
                aria-label={`Ver guia de ${step.title}`}
              >
                <span>{step.status === 'ready' ? '✓' : index + 1}</span>
                {index < steps.length - 1 ? <i /> : null}
              </DSButtonSecondary>

              <div className="foru-digital-route-step-body">
                <div className="foru-digital-route-step-top">
                  <div>
                    <MagicBadge>{step.guidePhase}</MagicBadge>
                    <h3>{step.title}</h3>
                  </div>
                  <span>{getStatusLabel(step.status)}</span>
                </div>
                <p>{step.outcome}</p>
                <div className="foru-digital-route-output">
                  <strong>Resultado:</strong> {step.artifactLabel}
                </div>
                <div className="foru-digital-route-mini-progress">
                  <span>{step.completedTasks}/{step.totalTasks} acciones completas</span>
                  <i><b style={{ width: `${step.totalTasks ? Math.round((step.completedTasks / step.totalTasks) * 100) : 0}%` }} /></i>
                </div>
                <div className="foru-digital-route-step-actions">
                  <DSButtonSecondary type="button" onClick={() => handleOpenStep(step.id)}>Ver guía</DSButtonSecondary>
                  <DSButtonSecondary type="button" onClick={() => handlePrimaryAction(step.id)}>
                    {step.id === 'landing' ? 'Abrir landing' : step.createdTasks > 0 ? 'Continuar' : 'Crear acciones'}
                  </DSButtonSecondary>
                </div>
              </div>
            </MagicCard>
          ))}
        </div>

        {activeStep ? (
          <aside className="foru-digital-route-panel" aria-label={`Guia de ${activeStep.title}`}>
            <div className="foru-digital-route-panel-header">
              <MagicBadge>{activeStep.badge}</MagicBadge>
              <DSButtonSecondary type="button" onClick={() => setSelectedStepId(null)} aria-label="Volver a la estacion actual">
                Actual
              </DSButtonSecondary>
            </div>
            <h2>{activeStep.title}</h2>
            <p>{activeStep.why}</p>

            <div className="foru-digital-route-panel-result">
              <span>Resultado esperado</span>
              <strong>{activeStep.artifactLabel}</strong>
            </div>

            <div className="foru-digital-route-subtasks">
              <h3>Acciones de esta estación</h3>
              {activeStep.tasks.map((task, index) => (
                <article key={`${activeStep.id}-${task.title}`} className={`foru-digital-route-subtask is-${task.priority}`}>
                  <div>
                    <span>{index + 1}</span>
                    <strong>{task.title}</strong>
                  </div>
                  <p>{task.description}</p>
                  <small>{task.time ?? '15 min'} · {(task.tools ?? ['For U']).join(' · ')}</small>
                  {task.tip ? <em>{task.tip}</em> : null}
                  {task.example ? <blockquote>{task.example}</blockquote> : null}
                </article>
              ))}
            </div>

            <div className="foru-digital-route-resources">
              <h3>Recursos disponibles</h3>
              {activeStep.resources.map((resource) => (
                <article key={resource.text}>
                  <span>{resource.icon}</span>
                  <div>
                    <strong>{resource.text}</strong>
                    <p>{resource.description}</p>
                    {resource.content && <DSButtonSecondary onClick={() => downloadBlob(new Blob([resource.content!], {type:'text/markdown;charset=utf-8'}),resource.filename ?? 'recurso.md')}>Descargar recurso</DSButtonSecondary>}
                  </div>
                </article>
              ))}
            </div>

            <div className="foru-digital-route-panel-actions">
              <MagicButton type="button" onClick={() => handlePrimaryAction(activeStep.id)}>
                {activeStep.primaryAction}
              </MagicButton>
              <MagicButton type="button" variant="soft" onClick={() => handleCompleteStep(activeStep.id)}>
                Marcar estación lista
              </MagicButton>
              {activeStep.createdTasks > 0 ? (
                <DSButtonSecondary type="button" onClick={onOpenTasks}>Ver tareas creadas</DSButtonSecondary>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function getStatusLabel(status: string) {
  if (status === 'ready') return 'Listo';
  if (status === 'in_progress') return 'En progreso';
  return 'Pendiente';
}
