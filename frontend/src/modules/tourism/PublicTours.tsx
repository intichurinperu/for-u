import ExperienceDetail from '../../toolkit/ExperienceDetail';
import '../../toolkit/pagePresentation.css';
import { Card as DSCard } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput } from '../../components/ui/DesignSystem';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import ProjectImage from '../../components/shared/ProjectImage';
import { loadTourDepartures, reservePublicTour, RejectedTourBooking, type PublicTourRequest } from '../../services/publicTourBookings';
import { tourMapUrl } from './model';
import type { PublicDeparture, PublishedTourism, TourBookingReceipt } from './tourismPublicationModel';
import './tourism.css';
const bookingApi = { departures: loadTourDepartures, reserve: reservePublicTour };

export default function PublicTours({ site, slug, revision, api = bookingApi }: { site: PublishedTourism; slug: string; revision: string; api?: typeof bookingApi }) {
  const [departures, setDepartures] = useState<PublicDeparture[]>([]);
  const [selectedTour, setSelectedTour] = useState('');
  const [request, setRequest] = useState<PublicTourRequest | null>(null);
  const [receipt, setReceipt] = useState<TourBookingReceipt | null>(null);
  const [notice, setNotice] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [attemptedRequest, setAttemptedRequest] = useState('');
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    async function refresh() {
      try { const rows = await api.departures(slug); if (active) { setDepartures(rows); setAvailabilityError(''); } }
      catch (error) { if (active) { setDepartures([]); setAvailabilityError((error as Error).message); } }
      finally { if (active) setLoading(false); }
    }
    void refresh();
    const interval = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [slug, attempt, api]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!request || submitting.current) return;
    submitting.current = true; setBusy(true); setAttemptedRequest(request.requestId); setNotice('');
    try { setReceipt(await api.reserve(slug, revision, request)); setNotice('Reserva confirmada. Guarda tu código y coordina el pago con la agencia.'); setAttempt(value => value + 1); }
    catch (error) { setNotice((error as Error).message); if (error instanceof RejectedTourBooking) setAttemptedRequest(''); setAttempt(value => value + 1); }
    finally { submitting.current = false; setBusy(false); }
  }
  const chosenDeparture = departures.find(item => item.id === request?.departureId);
  const tour = site.tours.find(item => item.id === chosenDeparture?.tourId);
  const whatsapp = site.settings.whatsapp.replace(/\D/g, '');
  const attempted = request?.requestId === attemptedRequest;
  return <div className="tourism-module tourism-public">
    <header><h1>{site.settings.name}</h1><p>{site.settings.about}</p><p>Horarios de {site.settings.timeZone.replaceAll('_', ' ')}.</p></header>
    <div className="tour-grid">{site.tours.map(item => <DSCard as="article" className="tour-card" key={item.id}>
      <ProjectImage value={item.image} alt={item.name} /><h2>{item.name}</h2><p>{item.description}</p><p className="tour-experience-price">S/ {item.price.toFixed(2)} <small>por persona</small></p>
      <ExperienceDetail value={{version:1,durationMinutes:item.durationMinutes,meetingPoint:item.meetingPoint,itinerary:item.itinerary}}/>{tourMapUrl(item)&&<a href={tourMapUrl(item)!} target="_blank" rel="noopener noreferrer">Ver punto en el mapa</a>}
      <DSButtonSecondary type="button" disabled={busy} aria-expanded={selectedTour === item.id} onClick={() => { setSelectedTour(item.id); setRequest(null); setReceipt(null); setNotice(''); }}>Ver salidas de {item.name}</DSButtonSecondary>
    </DSCard>)}</div>
    {selectedTour && <DSCard as="section" className="tour-card"><h2>Salidas disponibles</h2><p role="status">{loading ? 'Consultando plazas…' : availabilityError}</p><DSButtonSecondary disabled={busy} type="button" onClick={() => setAttempt(value => value + 1)}>Actualizar salidas</DSButtonSecondary>
      {!loading && !availabilityError && !departures.some(item => item.tourId === selectedTour) && <p>No hay salidas abiertas para esta experiencia.</p>}
      {departures.filter(item => item.tourId === selectedTour).map(item => <div className="tour-stop" key={item.id}><p>{item.date} · {item.time} · {item.available} plazas disponibles</p><DSButtonSecondary type="button" disabled={busy || item.available < 1} onClick={() => { setRequest({ departureId: item.id, customer: '', contact: '', people: 1, requestId: crypto.randomUUID() }); setReceipt(null); setNotice(''); }}>Reservar {item.date} {item.time}</DSButtonSecondary></div>)}
    </DSCard>}
    {request && <DSCard as="section" className="tour-card"><p role="status">{notice}</p>{receipt ? <><h2>Tu reserva está confirmada</h2><p>Código: <strong>{receipt.bookingId}</strong></p><p>{receipt.people} personas · Total: S/ {receipt.total.toFixed(2)}</p><p>Esta reserva no ha realizado ningún cobro.</p>{/^\d{8,15}$/.test(whatsapp) && <a target="_blank" rel="noopener noreferrer" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, quiero coordinar mi reserva ${receipt.bookingId}.`)}`}>Coordinar con la agencia</a>}</> : <form className="tour-form" onSubmit={submit}><fieldset disabled={busy} className="tour-form"><legend>Datos de tu reserva</legend>
      <label>Tu nombre<DSInput required disabled={attempted} minLength={2} maxLength={100} autoComplete="name" value={request.customer} onChange={event => setRequest({ ...request, customer: event.target.value })} /></label>
      <label>Email o teléfono de contacto<DSInput required disabled={attempted} minLength={3} maxLength={200} value={request.contact} onChange={event => setRequest({ ...request, contact: event.target.value })} /></label>
      <label>Personas<DSInput required disabled={attempted} type="number" min="1" max={chosenDeparture?.available || undefined} step="1" value={Number.isFinite(request.people) ? request.people : ''} onChange={event => setRequest({ ...request, people: event.target.valueAsNumber })} /></label>
      {tour && Number.isSafeInteger(request.people) && request.people > 0 && <p>Total: S/ {(Math.round(tour.price * 100) * request.people / 100).toFixed(2)}</p>}
      <p>La reserva asegura tus plazas. El pago se coordina con la agencia.</p><DSButtonSecondary type="submit" disabled={(!attempted && (!chosenDeparture || chosenDeparture.available < request.people)) || !Number.isSafeInteger(request.people)}>{busy ? 'Confirmando…' : attempted ? 'Revisar la misma solicitud' : 'Confirmar reserva'}</DSButtonSecondary>
    </fieldset></form>}</DSCard>}
  </div>;
}
