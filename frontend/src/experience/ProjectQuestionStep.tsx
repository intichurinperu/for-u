import { type FormEvent, type ReactNode, useEffect, useRef } from 'react';
import Logo from '../components/Logo';
import PearlButton from '../components/ui/PearlButton';
import { useDialogFocus } from '../toolkit/useDialogFocus';
import '../pages/registerPage.css';
import './projectNameStep.css';
import './projectActivityStep.css';
import './projectStageStep.css';

type Presentation = {
  key: string;
  label: string;
  title: string;
  intro: string;
  fieldLabel: string;
  placeholder: string;
  hint: string;
  choices: readonly { value: string; label: string; hint: string }[];
};

export type ProjectQuestionStepProps = {
  name: string;
  presentation: Presentation;
  value: string;
  busy: boolean;
  continueLabel: string;
  feedback: ReactNode;
  answerContent?: ReactNode;
  audioResponse?: ReactNode;
  audioPending?: boolean;
  saveHint?: string | null;
  progress?: { current: number; total: number };
  onChange: (value: string) => void;
  onContinue: () => void;
  onSkip?: () => void;
  onClose: () => void;
  onBack?: () => void;
};

export default function ProjectQuestionStep({ name, presentation, value, busy, continueLabel, feedback, answerContent, audioResponse, audioPending, saveHint, progress, onChange, onContinue, onSkip, onClose, onBack }: ProjectQuestionStepProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = presentation.choices.find(choice => choice.value === value);
  const navigationLocked = busy || audioPending;
  useDialogFocus(dialog, true, () => { if (!navigationLocked) onClose(); });
  useEffect(() => {
    const root = document.getElementById('root');
    const wasInert = root?.inert;
    const overflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    heading.current?.focus({ preventScroll: true });
    return () => {
      if (root) root.inert = wasInert ?? false;
      document.body.style.overflow = overflow;
    };
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!navigationLocked) onContinue();
  }

  return (
    <div className="project-create-overlay">
      <div ref={dialog} className="public-register project-name-page project-activity-page project-stage-page" role="dialog" aria-modal="true" aria-labelledby={`project-${presentation.key}-title`}>
        <header className="public-register-header project-question-header">
          <Logo />
          <PearlButton compact subtle disabled={navigationLocked} onClick={onClose}>Guardar y salir</PearlButton>
        </header>
        <main className="public-register-main">
          <div className="public-register-art project-activity-art" aria-hidden="true">
            <img src="/brand/foru-project-pavilion.png" alt="" width="1448" height="1086" />
            <p className="project-activity-art-caption">{presentation.label}</p>
          </div>
          <section className="public-register-content">
            {progress && <div className="journey-progress">
              <small>Pregunta {progress.current} de {progress.total}</small>
              <progress aria-label="Progreso del cuestionario" max={progress.total} value={progress.current} />
            </div>}
            <p className="project-name-eyebrow project-activity-name">{name}</p>
            <h1 ref={heading} id={`project-${presentation.key}-title`} tabIndex={-1}>{presentation.title}</h1>
            <p className="public-register-intro">{presentation.intro}</p>
            <form onSubmit={submit} className="public-register-form" aria-busy={busy}>
              {answerContent ?? <div className="public-register-field">
                <label htmlFor={`project-${presentation.key}`}>{presentation.fieldLabel} · {presentation.label}</label>
                <select id={`project-${presentation.key}`} name={presentation.key} value={value} disabled={busy} aria-describedby={`project-${presentation.key}-hint`} onChange={event => onChange(event.target.value)}>
                  <option value="">{presentation.placeholder}</option>
                  {value && !selected && <option value={value}>{value} · respuesta guardada</option>}
                  {presentation.choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
                </select>
                <p id={`project-${presentation.key}-hint`} className="project-name-field-hint" aria-live="polite">{selected?.hint ?? presentation.hint}</p>
              </div>}
              {audioResponse}
              {feedback}
              <PearlButton type="submit" disabled={navigationLocked}>{busy ? 'Guardando…' : continueLabel}</PearlButton>
              {saveHint !== null && <p className="public-register-hint">{saveHint ?? 'Tu respuesta se guarda al continuar.'}</p>}
              {(onBack || onSkip) && <div className="project-question-secondary-actions">
                {onBack && <PearlButton type="button" subtle disabled={navigationLocked} onClick={onBack}>Atrás</PearlButton>}
                {onSkip && <PearlButton type="button" subtle disabled={navigationLocked} onClick={onSkip}>Omitir por ahora</PearlButton>}
              </div>}
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
