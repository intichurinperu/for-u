import { type FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, BookOpen, BriefcaseBusiness, Coffee, Mountain, Store } from 'lucide-react';
import Logo from '../components/Logo';
import PearlButton from '../components/ui/PearlButton';
import { useDialogFocus } from '../toolkit/useDialogFocus';
import type { BusinessRoute } from '../workspace/contracts';
import type { CreationDraft } from './creationDraft';
import '../pages/registerPage.css';
import './projectNameStep.css';
import './projectActivityStep.css';

const activities = [
  { id: 'restaurant', label: 'Cafetería o restaurante', hint: 'Tu menú, tus pedidos y tus insumos.', icon: Coffee },
  { id: 'ecommerce', label: 'Tienda', hint: 'Tus productos, existencias y pedidos.', icon: Store },
  { id: 'hospitality', label: 'Hospedaje', hint: 'Tus habitaciones, disponibilidad y reservas.', icon: BedDouble },
  { id: 'tourism', label: 'Turismo', hint: 'Tus experiencias, salidas y cupos.', icon: Mountain },
  { id: 'courses', label: 'Cursos', hint: 'Tus cursos, módulos y lecciones.', icon: BookOpen },
  { id: 'services', label: 'Servicios u ofertas mixtas', hint: 'Tus servicios, paquetes y otras ofertas.', icon: BriefcaseBusiness },
] satisfies { id: BusinessRoute; label: string; hint: string; icon: typeof Coffee }[];

type Props = {
  name: string;
  route: BusinessRoute | null;
  entry: CreationDraft['entry'];
  prepared: boolean;
  busy: boolean;
  error: string;
  onRoute: (route: BusinessRoute | null) => void;
  onBack: () => void;
  onCreate: () => void;
  onClose: () => void;
};

export default function ProjectActivityStep({ name, route, entry, prepared, busy, error, onRoute, onBack, onCreate, onClose }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const select = useRef<HTMLSelectElement>(null);
  const [invalid, setInvalid] = useState(false);
  useDialogFocus(dialog, true, () => { if (!busy) onClose(); });
  const activity = activities.find(item => item.id === route);
  const Icon = activity?.icon;
  const action = prepared ? 'Reintentar guardado' : entry === 'manual' ? 'Abrir mi página' : entry === 'explore' ? 'Entrar a explorar' : 'Crear mi espacio';

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!route) {
      setInvalid(true);
      select.current?.focus();
      return;
    }
    onCreate();
  }

  return (
    <div className="project-create-overlay">
      <div ref={dialog} className="public-register project-name-page project-activity-page" role="dialog" aria-modal="true" aria-labelledby="project-activity-title">
        <header className="public-register-header"><Link to="/" aria-label="FOR U, volver al inicio" aria-disabled={busy || undefined} tabIndex={busy ? -1 : undefined} onClick={event => { if (busy) event.preventDefault(); }}><Logo /></Link></header>
        <main className="public-register-main">
          <div className="public-register-art project-activity-art" aria-hidden="true">
            <img src="/brand/foru-project-pavilion.png" alt="" width="1448" height="1086" />
            <div className="project-activity-art-caption">{Icon && <Icon size={24} strokeWidth={1.4} />}<span>{activity?.label ?? 'Tu espacio toma forma.'}</span></div>
          </div>
          <section className="public-register-content">
            <p className="project-name-eyebrow project-activity-name">{name.trim() || 'Tu proyecto'}</p>
            <h1 id="project-activity-title">¿Qué estás construyendo?</h1>
            <p className="public-register-intro">Elige tu actividad principal. Puedes combinar distintas ofertas.</p>
            <form onSubmit={submit} noValidate aria-busy={busy} className="public-register-form">
              <div className="public-register-field">
                <label htmlFor="project-activity">Tipo de negocio</label>
                <select ref={select} id="project-activity" name="activity" value={route ?? ''} disabled={busy || prepared} required aria-invalid={invalid} aria-describedby={`project-activity-hint${invalid ? ' project-activity-error' : ''}`} onChange={event => {
                  const next = activities.find(item => item.id === event.target.value);
                  setInvalid(false);
                  onRoute(next?.id ?? null);
                }}>
                  <option value="">Elige una actividad</option>
                  {activities.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <p id="project-activity-hint" className="project-name-field-hint" aria-live="polite">{prepared ? 'La actividad ya está preparada. Reintenta para completar el guardado.' : activity?.hint ?? 'Adaptaremos tu espacio a lo que haces.'}</p>
                {invalid && <p id="project-activity-error" className="public-register-field-error" role="alert">Elige una actividad para continuar.</p>}
              </div>
              {error && <p className="public-register-server-error" role="alert">{error}</p>}
              <PearlButton type="submit" disabled={busy}>{busy ? 'Guardando tu espacio…' : action}</PearlButton>
              <p className="public-register-hint" role="status">{busy ? 'Estamos guardando tu proyecto. Un momento…' : prepared ? 'Conservamos el mismo proyecto al reintentar.' : 'Al continuar guardaremos el proyecto en tu cuenta.'}</p>
              <PearlButton type="button" subtle disabled={busy || prepared} className="project-activity-back" onClick={onBack}>Atrás</PearlButton>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
