import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import PomodoroTimer from './PomodoroTimer';
import { usePomodoro } from '../contexts/PomodoroContext';
import './floatingPomodoro.css';

export default function FloatingPomodoro() {
  const [open, setOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const { remainingSeconds, totalSeconds, running, completed, areaColor, completionEvent } = usePomodoro();
  const previousCompleted = useRef(completionEvent);
  useEffect(() => {
    const justFinished = completionEvent > previousCompleted.current;
    previousCompleted.current = completionEvent;
    if (!completed) setCelebrating(false);
    if (!justFinished) return;
    setCelebrating(true);
    const timer = window.setTimeout(() => setCelebrating(false), 3000);
    return () => window.clearTimeout(timer);
  }, [completed, completionEvent]);
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
  const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / totalSeconds));
  const circumference = 2 * Math.PI * 43;
  return <aside className={`floating-pomodoro ${open ? 'is-open' : ''} ${running ? 'is-running' : ''} ${celebrating ? 'is-celebrating' : ''}`} style={{ '--focus-color': areaColor } as CSSProperties} aria-label="Pomodoro de enfoque">
    {open && <div id="global-pomodoro-panel" className="floating-pomodoro-panel"><PomodoroTimer durationSeconds={totalSeconds} onComplete={() => undefined} /></div>}
    {celebrating && <><div className="pomodoro-stars" aria-hidden="true">✦ ✧ ✦</div><span className="sr-only" role="status">Sesión completada. Puedes tomarte un descanso.</span></>}
    <DSButtonSecondary tooltip="Abre los controles para iniciar, pausar o ajustar tu sesión de enfoque." type="button" className="floating-pomodoro-toggle transition-transform duration-300 active:scale-95" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={open ? 'global-pomodoro-panel' : undefined} aria-label={`Pomodoro: ${completed ? 'sesión completada' : `${minutes}:${seconds}`}. ${open ? 'Cerrar' : 'Abrir'} controles`}>
      <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="pomodoro-orbit-track" cx="50" cy="50" r="43" /><circle className="pomodoro-orbit-progress" cx="50" cy="50" r="43" strokeDasharray={circumference} style={{ strokeDashoffset: circumference * (1 - progress) }} /></svg>
      <span className="pomodoro-orbit-time">{completed ? '✓' : `${minutes}:${seconds}`}</span>
      <small>{completed ? '¡Listo!' : running ? 'En foco' : 'Pomodoro'}</small>
    </DSButtonSecondary>
  </aside>;
}
