import { ButtonSecondary as DSButtonSecondary, Textarea as DSTextarea } from './ui/DesignSystem';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  moodLabels,
  type ForUMoodType,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';
import MagicBadge from './ui/MagicBadge';

const moods = Object.keys(moodLabels) as ForUMoodType[];

type EmotionalWellbeingPanelProps = {
  projectId: string | null;
};

export default function EmotionalWellbeingPanel({ projectId }: EmotionalWellbeingPanelProps) {
  const getTodayHabit = useActiveProjectsStore((state) => state.getTodayHabit);
  const completeTodayHabit = useActiveProjectsStore((state) => state.completeTodayHabit);
  const addDailyMood = useActiveProjectsStore((state) => state.addDailyMood);
  const getMoodPatternSummary = useActiveProjectsStore((state) => state.getMoodPatternSummary);
  const [selectedMood, setSelectedMood] = useState<ForUMoodType>('creative');
  const [notes, setNotes] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [lowBatteryMode, setLowBatteryMode] = useState(() => window.localStorage.getItem('foru-low-battery') === 'true');

  const habit = useMemo(() => getTodayHabit(projectId), [getTodayHabit, projectId]);
  const pattern = getMoodPatternSummary();

  async function saveMood() {
    await addDailyMood({ mood: selectedMood, notes });
    setNotes('');
    setSavedMessage(`Hoy te sentiste: ${moodLabels[selectedMood].label}. Gracias por contármelo.`);
    window.setTimeout(() => setSavedMessage(''), 3200);
  }

  async function markHabitDone() {
    await completeTodayHabit();
  }

  function toggleLowBatteryMode() {
    setLowBatteryMode((current) => {
      const next = !current;
      window.localStorage.setItem('foru-low-battery', String(next));
      return next;
    });
  }

  return (
    <div className={lowBatteryMode ? 'foru-emotional-panel is-low-battery' : 'foru-emotional-panel'}>
      <MagicCard className="foru-rewiring-card">
        <div className="foru-calm-card-top">
          <MagicBadge>Micro-hábito de hoy</MagicBadge>
          <DSButtonSecondary type="button" onClick={toggleLowBatteryMode}>
            {lowBatteryMode ? 'Modo simple' : 'Batería baja'}
          </DSButtonSecondary>
        </div>
        <h3>Un gesto pequeño para volver al cuerpo</h3>
        <p className="foru-habit-text">{habit.habit}</p>
        <MagicButton type="button" variant={habit.completed ? 'soft' : 'primary'} onClick={markHabitDone}>
          {habit.completed ? 'Hecho por hoy' : 'Lo hice con calma'}
        </MagicButton>
      </MagicCard>

      <MagicCard className="foru-mood-card">
        <MagicBadge>Cierre del día</MagicBadge>
        <h3>🌙 Terminar y descansar</h3>
        <p>Una pregunta suave antes de cerrar: ¿cómo estuvo tu sistema nervioso hoy?</p>

        <AnimatePresence initial={false}>
          {isClosingDay ? (
            <motion.div
              key="mood-form"
              className="foru-mood-form"
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 8 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="foru-mood-picker">
                {(lowBatteryMode ? moods.slice(0, 4) : moods).map((mood) => (
                  <DSButtonSecondary
                    key={mood}
                    type="button"
                    className={selectedMood === mood ? 'is-selected' : ''}
                    onClick={() => setSelectedMood(mood)}
                  >
                    <span>{moodLabels[mood].icon}</span>
                    {moodLabels[mood].label}
                  </DSButtonSecondary>
                ))}
              </div>
              {!lowBatteryMode ? (
                <DSTextarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="¿Qué te hizo sentir bien? Opcional."
                />
              ) : null}
              <MagicButton type="button" onClick={saveMood}>Guardar y soltar el día</MagicButton>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <MagicButton type="button" variant="soft" onClick={() => setIsClosingDay((current) => !current)}>
          {isClosingDay ? 'Cerrar este rincón' : '☕ Terminar y descansar'}
        </MagicButton>

        {savedMessage ? <p className="foru-mood-saved">{savedMessage}</p> : null}
        {!lowBatteryMode ? <small>{pattern}</small> : null}
      </MagicCard>
    </div>
  );
}
