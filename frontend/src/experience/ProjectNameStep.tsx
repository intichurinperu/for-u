import { type FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import PearlButton from '../components/ui/PearlButton';
import { useDialogFocus } from '../toolkit/useDialogFocus';
import '../pages/registerPage.css';
import './projectNameStep.css';

type Props = {
  name: string;
  readOnly: boolean;
  error: string;
  onName: (name: string) => void;
  onNext: () => void;
  onClose: () => void;
};

export default function ProjectNameStep({ name, readOnly, error, onName, onNext, onClose }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [invalid, setInvalid] = useState(false);
  useDialogFocus(dialog, true, onClose);

  function next(event: FormEvent) {
    event.preventDefault();
    if (!readOnly && !name.trim()) {
      setInvalid(true);
      input.current?.focus();
      return;
    }
    onNext();
  }

  return (
    <div className="project-create-overlay">
      <div ref={dialog} className="public-register project-name-page" role="dialog" aria-modal="true" aria-labelledby="project-name-title">
        <header className="public-register-header"><Link to="/" aria-label="FOR U, volver al inicio"><Logo /></Link></header>
        <main className="public-register-main">
          <div className="public-register-art" aria-hidden="true"><img src="/brand/foru-project-pavilion.png" alt="" width="1448" height="1086" /></div>
          <section className="public-register-content">
            <p className="project-name-eyebrow">Tu primer proyecto</p>
            <h1 id="project-name-title">¿Cómo se llama tu proyecto?</h1>
            <p className="public-register-intro">No necesitas tenerlo todo listo para empezar.</p>
            <form onSubmit={next} noValidate className="public-register-form">
              <div className="public-register-field">
                <label htmlFor="project-name">Nombre del proyecto</label>
                <input ref={input} id="project-name" name="project-name" value={name} onChange={event => { setInvalid(false); onName(event.target.value); }} maxLength={120} placeholder="Por ejemplo: Mi cafetería" readOnly={readOnly} required aria-invalid={invalid} aria-describedby={`project-name-hint${invalid ? ' project-name-error' : ''}`} />
                <p id="project-name-hint" className="project-name-field-hint">{readOnly ? 'Este proyecto está preparado. Continuemos con su guardado.' : 'Puedes cambiarlo después.'}</p>
                {invalid && <p id="project-name-error" className="public-register-field-error" role="alert">Escribe un nombre para tu proyecto. Puede ser provisional.</p>}
              </div>
              {error && <p className="public-register-server-error" role="alert">{error}</p>}
              <PearlButton type="submit">Continuar</PearlButton>
              <p className="public-register-hint">Después elegimos qué tipo de proyecto es.</p>
            </form>
            <Link to="/" className="public-register-back">Volver al inicio</Link>
          </section>
        </main>
      </div>
    </div>
  );
}
