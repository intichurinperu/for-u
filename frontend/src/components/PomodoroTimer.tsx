import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePomodoro } from '../contexts/PomodoroContext';

type PomodoroTimerProps = {
  taskTitle?: string;
  durationSeconds?: number;
  onComplete: () => void;
};

export default function PomodoroTimer({
  taskTitle = 'Una cosa a la vez',
  durationSeconds = 25 * 60,
  onComplete,
}: PomodoroTimerProps) {
  const { remainingSeconds, running: isRunning, completed: hasCompleted, start, pause, reset, soundEnabled, setSoundEnabled, legacyAvailable, restoreLegacy } = usePomodoro();
  const [minutesInput,setMinutesInput]=useState("25");
  const completionReported = useRef(false);
  useEffect(() => {
    if (hasCompleted && !completionReported.current) {
      completionReported.current = true;
      onComplete();
    }
    if (!hasCompleted) completionReported.current = false;
  }, [hasCompleted, onComplete]);

  const progress = useMemo(() => {
    return Math.max(0, Math.min(1, 1 - remainingSeconds / durationSeconds));
  }, [durationSeconds, remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
  const circumference = 2 * Math.PI * 54;

  return (
    <section className={`foru-pomodoro ${isRunning ? 'is-running' : ''}`} aria-label="Pomodoro de enfoque">
      <div className={`foru-pomodoro-ring ${isRunning ? 'is-iridescent motion-safe:animate-pulse' : ''}`} >
        <svg viewBox="0 0 128 128" role="img" aria-label={`${minutes}:${seconds}`}>
          <circle cx="64" cy="64" r="54" className="foru-pomodoro-track" />
          <circle
            cx="64"
            cy="64"
            r="54"
            className="foru-pomodoro-progress"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: circumference * (1 - progress), transition: 'stroke-dashoffset 350ms ease-out' }}
          />
        </svg>
        <div>
          <strong>{hasCompleted ? 'BINGO' : `${minutes}:${seconds}`}</strong>
          <span>{hasCompleted ? 'Un paso a tu ritmo' : `${Math.ceil(durationSeconds / 60)} min`}</span>
        </div>
      </div>

      <div className="foru-pomodoro-copy">
        <span>{taskTitle ? 'Tarea activa' : 'Elige una tarea'}</span>
        <p>{taskTitle ?? 'Selecciona una tarea pendiente para empezar con calma.'}</p>
      </div>

      {legacyAvailable && <DSButtonSecondary type="button" disabled={isRunning} onClick={restoreLegacy}>Recuperar mi temporizador anterior de este dispositivo</DSButtonSecondary>}<label>Duración (minutos)<input aria-label="Duración del Pomodoro en minutos" type="number" min="0.1" max="120" step="0.1" disabled={isRunning} value={minutesInput} onChange={e=>setMinutesInput(e.target.value)}/></label><label><input type="checkbox" checked={soundEnabled} onChange={e=>setSoundEnabled(e.target.checked)}/> Sonido suave al terminar</label><div className="foru-pomodoro-actions">
        <DSButtonSecondary
          type="button"
          onClick={() => start(hasCompleted || remainingSeconds === durationSeconds ? Number(minutesInput)*60 : remainingSeconds)}
          disabled={isRunning}
        >
          {isRunning ? 'En foco' : hasCompleted ? 'Empezar otro Pomodoro' : 'Empezar Pomodoro'}
        </DSButtonSecondary>
        <DSButtonSecondary
          type="button"
          onClick={() => {
            if (isRunning) pause(); else reset();
          }}
        >
          {isRunning ? 'Pausar' : 'Reiniciar'}
        </DSButtonSecondary>
      </div>

      {isRunning ? <div className="foru-pomodoro-dim" aria-hidden="true" /> : null}
    </section>
  );
}
