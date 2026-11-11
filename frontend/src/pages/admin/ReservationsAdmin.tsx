import { ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, MessageCircle, RefreshCw, Store } from '../../lib/icons';
import { loadConsultationRequests, type ConsultationRequestRecord } from '../../lib/consultationRequests';

function formatDate(value: string) {
  if (!value) return 'Sin fecha';

  return new Date(`${value}T12:00:00`).toLocaleDateString('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function formatTime(value: string) {
  if (!value) return 'Sin hora';
  const [hour, minute] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' });
}

export default function ReservationsAdmin() {
  const [requests, setRequests] = useState<ConsultationRequestRecord[]>([]);
  const [source, setSource] = useState<'local' | 'remote'>('local');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshRequests() {
    setIsLoading(true);
    const result = await loadConsultationRequests();
    setRequests(result.requests);
    setSource(result.source);
    setError(result.error);
    setIsLoading(false);
  }

  useEffect(() => {
    refreshRequests();
  }, []);

  const nextRequest = useMemo(() => requests[0], [requests]);

  return (
    <main className="foru-admin-page">
      <nav className="foru-admin-nav">
        <Link to="/" className="foru-logo">FOR <span>U</span></Link>
        <div className="foru-admin-nav-actions">
          <Link to="/mundo-digital" className="foru-btn foru-btn--outline">Ver landing</Link>
          <DSButtonSecondary type="button" className="foru-btn" onClick={refreshRequests} disabled={isLoading}>
            <RefreshCw size={17} /> Actualizar
          </DSButtonSecondary>
        </div>
      </nav>

      <section className="foru-admin-hero">
        <span className="foru-lp-badge"><CalendarCheck size={16} /> Panel privado</span>
        <h1>Reservas de diagnostico</h1>
        <p>Todo lo que llega desde “Agendar cita” queda ordenado aqui para que sepas quien reservo, cuando y que necesita.</p>
      </section>

      {error && (
        <div className="foru-admin-alert">
          Estoy mostrando el respaldo local. Para ver reservas remotas de Supabase aqui, falta conectar un login admin con permisos de lectura.
        </div>
      )}

      <section className="foru-admin-summary">
        <article>
          <span>Total</span>
          <strong>{requests.length}</strong>
        </article>
        <article>
          <span>Fuente</span>
          <strong>{source === 'remote' ? 'Supabase' : 'Local'}</strong>
        </article>
        <article>
          <span>Proxima</span>
          <strong>{nextRequest ? `${formatDate(nextRequest.appointment_date)} · ${formatTime(nextRequest.appointment_time)}` : 'Sin reservas'}</strong>
        </article>
      </section>

      <section className="foru-admin-list">
        {requests.length === 0 && (
          <div className="foru-admin-empty">
            <Store size={34} />
            <h2>Aun no hay reservas</h2>
            <p>Cuando alguien confirme desde la landing, aparecera aqui.</p>
          </div>
        )}

        {requests.map((request) => (
          <article key={request.id} className="foru-admin-reservation">
            <div className="foru-admin-reservation-time">
              <CalendarCheck size={20} />
              <strong>{formatDate(request.appointment_date)}</strong>
              <span><Clock size={15} /> {formatTime(request.appointment_time)}</span>
            </div>
            <div className="foru-admin-reservation-body">
              <div>
                <span className="foru-lp-label">{request.plan_interest ?? 'Plan por definir'}</span>
                <h2>{request.full_name}</h2>
                <p>{request.business_name || 'Negocio sin nombre'} · {request.business_type || 'Rubro por definir'}</p>
              </div>
              <p className="foru-admin-goal">{request.goal}</p>
              <div className="foru-admin-contact">
                {request.instagram_handle && <span>{request.instagram_handle}</span>}
                {request.email && <span>{request.email}</span>}
                {request.phone_whatsapp && <span>{request.phone_whatsapp}</span>}
                <span>{request.status}</span>
              </div>
            </div>
            <a
              className="foru-admin-whatsapp"
              href={`https://wa.me/${(request.phone_whatsapp ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${request.full_name}, confirmo tu cita FOR U para ${formatDate(request.appointment_date)} a las ${formatTime(request.appointment_time)}.`)}`}
              target="_blank"
              rel="noreferrer"
              title="Enviar mensaje"
            >
              <MessageCircle size={18} />
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
