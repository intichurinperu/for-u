import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { feelingLabels, type ForUActiveProject, type ForUNextAction } from '../stores/useActiveProjectsStore';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';
import GradientText from './ui/GradientText';

type ActionViewProps = {
  project: ForUActiveProject | null;
  action: ForUNextAction | null;
  completedAction: ForUNextAction | null;
  onComplete: (point: { x: number; y: number }) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function ActionView({
  project,
  action,
  completedAction,
  onComplete,
  onNext,
  onBack,
}: ActionViewProps) {
  if (!project) {
    return (
      <section className="foru-action-view">
        <MagicCard as="div" className="foru-action-card">
          <span>📌</span>
          <h1><GradientText>Elige un proyecto para empezar</GradientText></h1>
          <MagicButton type="button" onClick={onBack}>Volver al tablero</MagicButton>
        </MagicCard>
      </section>
    );
  }

  if (completedAction) {
    const completedFeeling = project.targetFeelings[0];
    return (
      <section className="foru-action-view">
        <motion.div
          className="foru-action-card is-celebrating magic-card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <div className="foru-action-confetti" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, index) => <i key={index} style={{ '--i': index } as CSSProperties} />)}
          </div>
          <span>🎉</span>
          <p>{project.name}</p>
          <h1><GradientText>¡Excelente!</GradientText></h1>
          <strong>+{completedAction.rewardCoins} monedas</strong>
          {completedFeeling ? (
            <p className="foru-action-feeling-win">
              ✅ +10% hacia tu {feelingLabels[completedFeeling].label}
            </p>
          ) : null}
          <small>¿Seguimos con la siguiente acción o prefieres descansar?</small>
          <div className="foru-action-card-actions">
            <MagicButton type="button" onClick={onNext}>Siguiente acción</MagicButton>
            <MagicButton type="button" variant="soft" onClick={onBack}>Volver al tablero</MagicButton>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="foru-action-view">
      <motion.div
        className="foru-action-card magic-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <MagicButton type="button" variant="ghost" className="foru-action-back" onClick={onBack}>← Volver al tablero</MagicButton>
        <p>{project.name}</p>
        <span>{action?.priority === 'high' ? '🔥' : action?.priority === 'medium' ? '🎯' : '🌿'}</span>
        <small>Perfecto. Tu primera acción:</small>
        <h1><GradientText>{action?.title ?? 'No hay accion pendiente'}</GradientText></h1>
        {project.targetFeelings[0] ? (
          <p className="foru-action-feeling">
            Esta acción no es solo trabajo. Es un paso hacia tu {feelingLabels[project.targetFeelings[0]].icon} {feelingLabels[project.targetFeelings[0]].label}.
          </p>
        ) : null}
        <small>{action ? `Tienes ${action.estimatedMinutes} minutos. Vamos de a una cosa.` : 'Puedes volver al tablero y elegir otro proyecto.'}</small>

        <div className="foru-action-meta">
          <strong>{action?.estimatedMinutes ?? 5} min</strong>
          <strong>{action?.rewardCoins ?? 5} monedas</strong>
        </div>

        <div className="foru-action-card-actions">
          <MagicButton
            type="button"
            disabled={!action}
            onClick={(event) => onComplete({ x: event.clientX, y: event.clientY })}
          >
            ✅ Completar
          </MagicButton>
          <MagicButton type="button" variant="soft" onClick={() => window.alert(`Temporizador de ${action?.estimatedMinutes ?? 15} min iniciado ⏰`)}>
            ⏰ Temporizador
          </MagicButton>
          <MagicButton type="button" variant="ghost" onClick={onBack}>
            ⏸️ Pausar
          </MagicButton>
        </div>
      </motion.div>
    </section>
  );
}
