import { Card as DSCard } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput, Textarea as DSTextarea } from '../../components/ui/DesignSystem';
import ProjectImage from '../../components/shared/ProjectImage';
import ProjectImageField from '../../components/shared/ProjectImageField';
import { useModuleDraft } from '../useModuleDraft';
import { Fragment, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays, localDate } from '../dates';
import { changeBookingStatus, hospitalitySummary, occupiesRoom, removeRoom, saveBooking, saveFinanceEntry, saveRoom, type Booking, type FinanceEntry, type HospitalityData, type Room } from './model';
import './hospitality.css';

export type HospitalityProps = { data: HospitalityData; onChange: (data: HospitalityData) => void };
const roomStatus = { clean: 'Limpia', dirty: 'Necesita limpieza', maintenance: 'Mantenimiento' };
const bookingStatus = { pending: 'Pendiente', confirmed: 'Confirmada', 'checked-in': 'Alojado', 'checked-out': 'Finalizada', cancelled: 'Cancelada' };
const views = { rooms: 'Habitaciones', bookings: 'Reservas y calendario', housekeeping: 'Limpieza', guests: 'Huéspedes', finance: 'Finanzas' };

export default function HospitalityDashboard({ data, onChange }: HospitalityProps) {
  const [params, setParams] = useSearchParams();
  const requestedView = params.get('view') ?? 'rooms';
  const view = Object.hasOwn(views, requestedView) ? requestedView as keyof typeof views : 'rooms';
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [entry, setEntry] = useState<FinanceEntry | null>(null);
  useModuleDraft(!!room || !!booking || !!entry);
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const summary = hospitalitySummary(data, `${month}-01`);
  const todaySummary = hospitalitySummary(data, localDate());
  const days = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  function act(operation: () => HospitalityData, success: string) {
    try { onChange(operation()); setMessage(success); return true; }
    catch (error) { setMessage((error as Error).message); return false; }
  }
  function submit(event: FormEvent, operation: () => HospitalityData, close: () => void) { event.preventDefault(); if (act(operation, 'Cambio registrado. Recuerda guardar el proyecto.')) close(); }
  function startBooking(roomId = data.rooms[0]?.id ?? '', date = localDate()) {
    const selectedRoom = data.rooms.find(item => item.id === roomId);
    setBooking({ id: crypto.randomUUID(), roomId, guest: '', contact: '', guests: 1, checkIn: date, checkOut: addDays(date, 1), nightlyRate: selectedRoom?.price ?? 0, total: 0, status: 'confirmed', notes: '' });
  }
  function chooseView(value: string) { const next = new URLSearchParams(params); next.set('view', value); setParams(next); setMessage(''); }
  return <div className="hospitality-module">
    <label className="hospitality-view">Sección del hospedaje<select value={view} onChange={event => chooseView(event.target.value)}>{Object.entries(views).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    <h2>{views[view]}</h2><p role="status">{message}</p>
    {view === 'rooms' && <>
      <div className="stats-row"><Metric label="Habitaciones" value={data.rooms.length} /><Metric label="Ocupadas hoy" value={todaySummary.occupied} /><Metric label="Limpias y libres hoy" value={todaySummary.available} /></div>
      <DSCard as="section" className="component-card"><div className="component-header"><h3>Tus habitaciones</h3><DSButtonSecondary onClick={() => setRoom({ id: crypto.randomUUID(), name: '', type: 'Doble', price: 0, capacity: 2, image: '', status: 'clean', amenities: [] })}>Nueva habitación</DSButtonSecondary></div>
        <div className="rooms-grid">{data.rooms.map(item => <DSCard as="article" className="room-card" key={item.id}>
          <ProjectImage className="room-img" value={item.image} alt={item.name} />
          <div className="room-info"><h3>{item.name}</h3><p>{item.type} · {item.capacity} personas</p><p>{roomStatus[item.status]}</p><strong className="room-price">S/ {item.price.toFixed(2)} / noche</strong><p>{item.amenities.join(' · ')}</p><DSButtonSecondary onClick={() => setRoom(structuredClone(item))}>Editar {item.name}</DSButtonSecondary></div>
        </DSCard>)}</div>{!data.rooms.length && <p>Agrega tu primera habitación para abrir el calendario.</p>}
      </DSCard>
    </>}
    {room && <form className="component-card hospitality-form" onSubmit={event => submit(event, () => saveRoom(data, room), () => setRoom(null))}>
      <h3>Datos de habitación</h3><label>Nombre<DSInput required value={room.name} onChange={event => setRoom({ ...room, name: event.target.value })} /></label>
      <label>Tipo<select value={room.type} onChange={event => setRoom({ ...room, type: event.target.value })}>{['Individual', 'Doble', 'Matrimonial', 'Familiar', 'Suite'].map(type => <option key={type}>{type}</option>)}</select></label>
      <label>Precio por noche (S/)<DSInput type="number" required min="0" step="0.01" value={Number.isFinite(room.price) ? room.price : ''} onChange={event => setRoom({ ...room, price: event.target.valueAsNumber })} /></label>
      <label>Capacidad<DSInput type="number" min="1" step="1" required value={Number.isFinite(room.capacity) ? room.capacity : ''} onChange={event => setRoom({ ...room, capacity: event.target.valueAsNumber })} /></label>
      <label>Estado de habitación<select value={room.status} onChange={event => setRoom({ ...room, status: event.target.value as Room['status'] })}>{Object.entries(roomStatus).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>
      <ProjectImageField label="Imagen de la habitación" value={room.image} onChange={value => setRoom({ ...room, image: value })} />
      <fieldset><legend>Comodidades</legend><div className="hospitality-actions">{['WiFi', 'A/C', 'TV', 'Desayuno', 'Jacuzzi', 'Cocina', 'Balcón', 'Calefacción'].map(amenity => <label className="hospitality-check" key={amenity}><DSInput type="checkbox" checked={room.amenities.includes(amenity)} onChange={event => setRoom({ ...room, amenities: event.target.checked ? [...room.amenities, amenity] : room.amenities.filter(item => item !== amenity) })} />{amenity}</label>)}</div></fieldset>
      <div className="hospitality-actions"><DSButtonSecondary type="submit">Guardar habitación</DSButtonSecondary><DSButtonSecondary type="button" onClick={() => setRoom(null)}>Cancelar edición</DSButtonSecondary>{data.rooms.some(item => item.id === room.id) && <DSButtonSecondary type="button" onClick={() => { if (window.confirm('¿Eliminar esta habitación sin reservas?') && act(() => removeRoom(data, room.id), 'Habitación eliminada.')) setRoom(null); }}>Eliminar habitación</DSButtonSecondary>}</div>
    </form>}
    {view === 'bookings' && <DSCard as="section" className="component-card">
      <div className="component-header"><h3>Calendario de reservas</h3><DSButtonSecondary disabled={!data.rooms.length} onClick={() => startBooking()}>Nueva reserva</DSButtonSecondary></div>
      <label>Mes del calendario<DSInput type="month" required value={month} onChange={event => { if (/^\d{4}-\d{2}$/.test(event.target.value)) setMonth(event.target.value); }} /></label>
      <div className="calendar-wrapper"><div className="calendar-grid" style={{ gridTemplateColumns: `180px repeat(${days}, minmax(40px,1fr))` }}>
        <div className="cal-header-cell">Habitación</div>{Array.from({ length: days }, (_, index) => <div className="cal-header-cell" key={index}>{index + 1}</div>)}
        {data.rooms.map(item => <Fragment key={item.id}><div className="cal-room-label">{item.name}</div>{Array.from({ length: days }, (_, index) => {
          const date = `${month}-${String(index + 1).padStart(2, '0')}`;
          const stay = data.bookings.find(value => value.roomId === item.id && occupiesRoom(value) && value.checkIn <= date && value.checkOut > date);
          const departed = data.bookings.some(value => value.roomId === item.id && occupiesRoom(value) && value.checkOut === date);
          return <DSButtonSecondary type="button" className={`cal-day-cell ${stay ? stay.checkIn === date ? 'checkin' : 'occupied' : departed ? 'checkout' : 'available'}`} key={date} aria-label={`${item.name}, ${date}: ${stay ? stay.guest : departed ? 'Salida, noche disponible' : 'Disponible'}`} onClick={() => stay ? setBooking({ ...stay }) : startBooking(item.id, date)}>{stay ? stay.checkIn === date ? '→' : '●' : departed ? '←' : '·'}</DSButtonSecondary>;
        })}</Fragment>)}
      </div></div><p>→ Entrada · ● Reservada · ← Salida (la noche queda libre). El mantenimiento se comprueba al reservar.</p>
      <div className="hospitality-table"><table><thead><tr><th>Huésped</th><th>Habitación</th><th>Fechas</th><th>Total acordado</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.bookings.map(item => <tr key={item.id}>
        <td>{item.guest}</td><td>{data.rooms.find(value => value.id === item.roomId)?.name}</td><td>{item.checkIn} → {item.checkOut}</td><td>S/ {item.total.toFixed(2)}</td><td>{bookingStatus[item.status]}</td><td><DSButtonSecondary onClick={() => setBooking({ ...item })}>Ver reserva de {item.guest}</DSButtonSecondary></td>
      </tr>)}</tbody></table></div>
    </DSCard>}
    {booking && <form className="component-card hospitality-form" onSubmit={event => submit(event, () => saveBooking(data, booking), () => setBooking(null))}>
      <h3>Reserva · {bookingStatus[booking.status]}</h3>
      <fieldset disabled={['checked-out', 'cancelled'].includes(booking.status)} className="hospitality-form">
        <label>Nombre del huésped<DSInput required value={booking.guest} onChange={event => setBooking({ ...booking, guest: event.target.value })} /></label>
        <label>Contacto<DSInput value={booking.contact} onChange={event => setBooking({ ...booking, contact: event.target.value })} /></label>
        <label>Habitación<select required value={booking.roomId} onChange={event => setBooking({ ...booking, roomId: event.target.value, nightlyRate: data.rooms.find(item => item.id === event.target.value)?.price ?? 0 })}>{data.rooms.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Personas<DSInput type="number" min="1" step="1" required value={Number.isFinite(booking.guests) ? booking.guests : ''} onChange={event => setBooking({ ...booking, guests: event.target.valueAsNumber })} /></label>
        <label>Entrada<DSInput type="date" required value={booking.checkIn} onChange={event => setBooking({ ...booking, checkIn: event.target.value })} /></label>
        <label>Salida<DSInput type="date" required value={booking.checkOut} onChange={event => setBooking({ ...booking, checkOut: event.target.value })} /></label>
        <label>Tarifa acordada por noche (S/)<DSInput type="number" required min="0" step="0.01" value={Number.isFinite(booking.nightlyRate) ? booking.nightlyRate : ''} onChange={event => setBooking({ ...booking, nightlyRate: event.target.valueAsNumber })} /></label>
        <label>Notas<DSTextarea value={booking.notes} onChange={event => setBooking({ ...booking, notes: event.target.value })} /></label>
        <DSButtonSecondary type="submit">Guardar reserva</DSButtonSecondary>
      </fieldset>
      <p>Crear una reserva no registra un cobro. Los pagos recibidos se anotan en Finanzas.</p>
      <div className="hospitality-actions">
        {data.bookings.some(item => item.id === booking.id) && (booking.status === 'pending' ? ['confirmed', 'cancelled'] : booking.status === 'confirmed' ? ['checked-in', 'cancelled'] : booking.status === 'checked-in' ? ['checked-out'] : []).map(status => <DSButtonSecondary type="button" key={status} onClick={() => { if (act(() => changeBookingStatus(data, booking.id, status as Booking['status']), 'Estado de reserva actualizado.')) setBooking(null); }}>{bookingStatus[status as Booking['status']]}</DSButtonSecondary>)}
        <DSButtonSecondary type="button" onClick={() => setBooking(null)}>Cerrar reserva</DSButtonSecondary>
      </div>
    </form>}
    {view === 'housekeeping' && <DSCard as="section" className="component-card"><h3>Control de limpieza</h3><div className="housekeeping-grid">{data.rooms.map(item => <article className={`hk-item ${item.status}`} key={item.id}><h3>{item.name}</h3><label>Estado de {item.name}<select value={item.status} onChange={event => act(() => saveRoom(data, { ...item, status: event.target.value as Room['status'] }), 'Estado de limpieza actualizado.')}>{Object.entries(roomStatus).map(([id, title]) => <option value={id} key={id}>{title}</option>)}</select></label></article>)}</div></DSCard>}
    {view === 'guests' && <DSCard as="section" className="component-card"><h3>Huéspedes y estancias</h3><p>Datos de contacto registrados en cada reserva.</p><div className="rooms-grid">{data.bookings.filter(item => item.status !== 'cancelled').map(item => <DSCard as="article" key={item.id} className="room-card room-info"><h3>{item.guest}</h3><p>{item.contact || 'Sin contacto registrado'}</p><p>{item.guests} personas · {bookingStatus[item.status]}</p><p>{item.checkIn} → {item.checkOut}</p><DSButtonSecondary onClick={() => setBooking({ ...item })}>Ver estancia de {item.guest}</DSButtonSecondary></DSCard>)}</div></DSCard>}
    {view === 'finance' && <DSCard as="section" className="component-card"><div className="component-header"><h3>Movimientos registrados</h3><DSButtonSecondary onClick={() => setEntry({ id: crypto.randomUUID(), type: 'income', amount: 0, concept: '', date: localDate() })}>Registrar movimiento</DSButtonSecondary></div>
      <label>Mes de finanzas<DSInput type="month" value={month} onChange={event => { if (/^\d{4}-\d{2}$/.test(event.target.value)) setMonth(event.target.value); }} /></label>
      <div className="stats-row"><Metric label="Ingresos del mes" value={`S/ ${summary.income.toFixed(2)}`} /><Metric label="Gastos del mes" value={`S/ ${summary.expense.toFixed(2)}`} /><Metric label="Balance del mes" value={`S/ ${summary.profit.toFixed(2)}`} /></div>
      <div className="hospitality-table"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Tipo</th><th>Monto</th></tr></thead><tbody>{data.finances.filter(item => item.date.startsWith(month)).map(item => <tr key={item.id}><td>{item.date}</td><td>{item.concept}</td><td>{item.type === 'income' ? 'Ingreso' : 'Gasto'}</td><td>S/ {item.amount.toFixed(2)}</td></tr>)}</tbody></table></div>
    </DSCard>}
    {entry && <form className="component-card hospitality-form" onSubmit={event => submit(event, () => saveFinanceEntry(data, entry), () => setEntry(null))}>
      <h3>Registrar movimiento</h3><label>Tipo de movimiento<select value={entry.type} onChange={event => setEntry({ ...entry, type: event.target.value as FinanceEntry['type'] })}><option value="income">Ingreso recibido</option><option value="expense">Gasto pagado</option></select></label>
      <label>Concepto<DSInput required value={entry.concept} onChange={event => setEntry({ ...entry, concept: event.target.value })} /></label><label>Monto (S/)<DSInput type="number" required min="0.01" step="0.01" value={Number.isFinite(entry.amount) ? entry.amount : ''} onChange={event => setEntry({ ...entry, amount: event.target.valueAsNumber })} /></label>
      <label>Fecha del movimiento<DSInput type="date" required value={entry.date} onChange={event => setEntry({ ...entry, date: event.target.value })} /></label><label>Reserva asociada<select value={entry.bookingId ?? ''} onChange={event => setEntry({ ...entry, bookingId: event.target.value || undefined })}><option value="">Sin reserva</option>{data.bookings.map(item => <option key={item.id} value={item.id}>{item.guest} · {item.checkIn}</option>)}</select></label>
      <div className="hospitality-actions"><DSButtonSecondary type="submit">Guardar movimiento</DSButtonSecondary><DSButtonSecondary type="button" onClick={() => setEntry(null)}>Cancelar movimiento</DSButtonSecondary></div>
    </form>}
  </div>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <article className="stat-box"><h3 className="stat-label">{label}</h3><strong className="stat-value">{value}</strong></article>; }
