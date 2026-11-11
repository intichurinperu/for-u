import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { type EnergyLevel, saveEnergyCheck } from '../hooks/useDopamineRoute';

// ---------------------------------------------------------------------------
// EnergyCheck — "¿Cómo llegas hoy?" interceptor
// Shown once per day on return. Adapts the UI to user's energy level.
// ---------------------------------------------------------------------------

type EnergyCheckProps = {
  isOpen: boolean;
  userName?: string;
  onComplete: (level: EnergyLevel) => void;
};

const energyOptions: Array<{ level: EnergyLevel; emoji: string; label: string; description: string }> = [
  {
    level: 'high',
    emoji: '🟢',
    label: 'Con energía',
    description: 'Lista para avanzar estaciones y crear.',
  },
  {
    level: 'normal',
    emoji: '🟡',
    label: 'Normal',
    description: 'Puedo hacer un par de cosas con calma.',
  },
  {
    level: 'low',
    emoji: '🔴',
    label: 'Agotada',
    description: 'Solo quiero soltar una idea o respirar.',
  },
];

export default function EnergyCheck({ isOpen, userName, onComplete }: EnergyCheckProps) {
  const [selected, setSelected] = useState<EnergyLevel | null>(null);

  function handleSelect(level: EnergyLevel) {
    setSelected(level);
    saveEnergyCheck(level);
    // Small delay for visual feedback before closing
    window.setTimeout(() => onComplete(level), 400);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="foru-energy-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.section
            className="foru-energy-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="energy-check-title"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="foru-energy-header">
              <motion.span
                className="foru-energy-wave"
                aria-hidden="true"
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                🌸
              </motion.span>
              <small>Un segundo antes de empezar</small>
              <h2 id="energy-check-title">
                Hola{userName ? `, ${userName}` : ''}. ¿Cómo llegas hoy?
              </h2>
              <p>No hay respuesta correcta. Esto adapta tu experiencia.</p>
            </div>

            <div className="foru-energy-options">
              {energyOptions.map((option) => (
                <motion.button
                  key={option.level}
                  type="button"
                  className={`foru-energy-option ${selected === option.level ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(option.level)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="foru-energy-emoji">{option.emoji}</span>
                  <div>
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </div>
                  {selected === option.level && (
                    <motion.i
                      className="foru-energy-check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                    >
                      ✓
                    </motion.i>
                  )}
                </motion.button>
              ))}
            </div>

            <p className="foru-energy-footer">
              Si eliges "Agotada", For U solo te mostrará el frasco de ideas y un micro-hábito. Nada más.
            </p>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
