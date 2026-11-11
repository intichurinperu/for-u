import { Textarea as DSTextarea, ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  feelingLabels,
  type ForUActiveProject,
  type ForUFeelingType,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';
import GradientText from './ui/GradientText';

const feelings = Object.keys(feelingLabels) as ForUFeelingType[];

type EmotionalOnboardingModalProps = {
  project: ForUActiveProject | null;
};

export default function EmotionalOnboardingModal({ project }: EmotionalOnboardingModalProps) {
  const setProjectEmotionalOnboarding = useActiveProjectsStore((state) => state.setProjectEmotionalOnboarding);
  const [goal, setGoal] = useState(project?.tangibleGoal ?? '');
  const [selectedFeelings, setSelectedFeelings] = useState<ForUFeelingType[]>(project?.targetFeelings ?? []);
  const [saving, setSaving] = useState(false);

  if (!project || project.targetFeelings.length > 0) return null;

  async function save() {
    if (!project || selectedFeelings.length === 0) return;
    setSaving(true);
    await setProjectEmotionalOnboarding(project.id, {
      tangibleGoal: goal || project.name,
      targetFeelings: selectedFeelings,
    });
    setSaving(false);
  }

  function toggleFeeling(feeling: ForUFeelingType) {
    setSelectedFeelings((current) =>
      current.includes(feeling)
        ? current.filter((item) => item !== feeling)
        : [...current, feeling].slice(0, 4),
    );
  }

  return (
    <div className="foru-emotional-backdrop" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <MagicCard className="foru-emotional-modal">
          <div className="foru-emotional-modal-intro">
            <span className="foru-emotional-orb">🤍</span>
            <small>Una pausa antes de avanzar</small>
            <h2><GradientText>Conectemos con el porqué</GradientText></h2>
            <p>Es normal sentirse abrumada cuando algo importa. For U va a guardar también la emoción que quieres cuidar.</p>
          </div>

          <label className="foru-soft-question">
            <span>¿Qué quieres lograr?</span>
            <DSTextarea
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Ej: Lanzar mi taller de velas para Navidad"
            />
          </label>

          <div className="foru-feeling-picker">
            <strong>¿Cómo quieres sentirte al lograrlo?</strong>
            <small>Elige hasta 4. No hay respuesta correcta.</small>
            <div>
              {feelings.map((feeling) => {
                const label = feelingLabels[feeling];
                const isSelected = selectedFeelings.includes(feeling);
                return (
                  <DSButtonSecondary
                    key={feeling}
                    type="button"
                    className={isSelected ? 'is-selected' : ''}
                    onClick={() => toggleFeeling(feeling)}
                  >
                    <span>{label.icon}</span>
                    <em>{label.label}</em>
                    <AnimatePresence>
                      {isSelected ? (
                        <motion.i
                          aria-hidden="true"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.38, ease: 'easeOut' }}
                        />
                      ) : null}
                    </AnimatePresence>
                  </DSButtonSecondary>
                );
              })}
            </div>
          </div>

          <div className="foru-emotional-modal-footer">
            <p>Esta brújula aparecerá junto a tus tareas para recordarte que avanzar también puede sentirse bien.</p>
            <MagicButton type="button" disabled={selectedFeelings.length === 0 || saving} onClick={save}>
              {saving ? 'Guardando con calma...' : 'Guardar brújula emocional'}
            </MagicButton>
          </div>
        </MagicCard>
      </motion.div>
    </div>
  );
}
