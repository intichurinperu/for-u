import { dayNumber } from '../dates.ts';
export type Tour = { id: string; name: string; description: string; price: number; durationMinutes: number; image: string; active: boolean; itinerary: Array<{ id: string; title: string; description: string }>; meetingPoint: string; latitude: number | null; longitude: number | null };
export type Guide = { id: string; name: string; contact: string; languages: string };
export type Departure = { id: string; tourId: string; guideId: string; date: string; time: string; capacity: number };
export type TourBooking = { id: string; departureId: string; customer: string; contact: string; people: number; total: number; status: 'confirmed' | 'cancelled' };
export type TourismData = { presentationVersion?: import('../../presentation/model').PresentationVersion; version: 1; tours: Tour[]; guides: Guide[]; departures: Departure[]; bookings: TourBooking[]; settings: { name: string; about: string; whatsapp: string; timeZone?: string } };
export function emptyTourism(name: string): TourismData { return { version: 1, tours: [], guides: [], departures: [], bookings: [], settings: { name, about: '', whatsapp: '' } }; }
const count = (value: number) => Number.isSafeInteger(value) && value > 0;
export function bookedSeats(data: TourismData, departureId: string) { return data.bookings.filter(booking => booking.departureId === departureId && booking.status === 'confirmed').reduce((total, booking) => total + booking.people, 0); }
function startMinute(departure: Departure) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(departure.time)) throw new Error('Selecciona una hora válida.');
  const [hours, minutes] = departure.time.split(':').map(Number);
  return dayNumber(departure.date) * 1440 + hours * 60 + minutes;
}
export function saveTour(data: TourismData, tour: Tour): TourismData {
  if (!tour.name.trim() || !Number.isFinite(tour.price) || tour.price < 0 || !count(tour.durationMinutes)) throw new Error('Completa nombre, precio válido y duración en minutos.');
  if (!validTourLocation(tour)) throw new Error('Las coordenadas del punto de encuentro no son válidas.');
  const clean = { ...tour, name: tour.name.trim(), price: Math.round(tour.price * 100) / 100 };
  const next = { ...data, tours: data.tours.some(item => item.id === tour.id) ? data.tours.map(item => item.id === tour.id ? clean : item) : [...data.tours, clean] };
  for (const departure of next.departures.filter(item => item.tourId === tour.id)) validateDeparture(next, departure);
  return next;
}
export function saveGuide(data: TourismData, guide: Guide): TourismData {
  if (!guide.name.trim()) throw new Error('Escribe el nombre del guía.');
  return { ...data, guides: data.guides.some(item => item.id === guide.id) ? data.guides.map(item => item.id === guide.id ? guide : item) : [...data.guides, guide] };
}
function validateDeparture(data: TourismData, departure: Departure) {
  const tour = data.tours.find(item => item.id === departure.tourId);
  if (!tour) throw new Error('Selecciona un tour existente.');
  if (!data.guides.some(guide => guide.id === departure.guideId)) throw new Error('Selecciona un guía.');
  if (!count(departure.capacity) || departure.capacity < bookedSeats(data, departure.id)) throw new Error('La capacidad debe cubrir las plazas ya reservadas.');
  const start = startMinute(departure);
  for (const other of data.departures) {
    if (other.id === departure.id || other.guideId !== departure.guideId) continue;
    const otherTour = data.tours.find(item => item.id === other.tourId);
    if (otherTour && start < startMinute(other) + otherTour.durationMinutes && start + tour.durationMinutes > startMinute(other)) throw new Error('El guía tiene otra salida en ese horario.');
  }
}
export function saveDeparture(data: TourismData, departure: Departure): TourismData {
  validateDeparture(data, departure);
  const old = data.departures.find(item => item.id === departure.id);
  if (old && data.bookings.some(booking => booking.departureId === old.id) && (old.tourId !== departure.tourId || old.date !== departure.date || old.time !== departure.time)) throw new Error('Esta salida ya tiene reservas. Conserva sus fechas y crea una salida nueva para reprogramar.');
  return { ...data, departures: old ? data.departures.map(item => item.id === departure.id ? departure : item) : [...data.departures, departure] };
}
export function reserveTour(data: TourismData, booking: Omit<TourBooking, 'total' | 'status'>): TourismData {
  if (data.bookings.some(item => item.id === booking.id)) return data;
  const departure = data.departures.find(item => item.id === booking.departureId);
  const tour = data.tours.find(item => item.id === departure?.tourId);
  if (!departure || !tour?.active) throw new Error('Esta experiencia no está disponible.');
  if (!booking.customer.trim() || !booking.contact.trim() || !count(booking.people)) throw new Error('Completa nombre, contacto y cantidad de personas.');
  if (bookedSeats(data, departure.id) + booking.people > departure.capacity) throw new Error('No quedan suficientes plazas para esa fecha.');
  return { ...data, bookings: [...data.bookings, { ...booking, total: Math.round(tour.price * 100) * booking.people / 100, status: 'confirmed' }] };
}
export function cancelTourBooking(data: TourismData, id: string): TourismData { return { ...data, bookings: data.bookings.map(item => item.id === id ? { ...item, status: 'cancelled' } : item) }; }
export function validTourLocation(tour:Pick<Tour,'latitude'|'longitude'>){return tour.latitude===null&&tour.longitude===null||typeof tour.latitude==='number'&&Number.isFinite(tour.latitude)&&Math.abs(tour.latitude)<=90&&typeof tour.longitude==='number'&&Number.isFinite(tour.longitude)&&Math.abs(tour.longitude)<=180;}
export function tourMapUrl(tour: Pick<Tour, 'latitude' | 'longitude'>) { if(!validTourLocation(tour)||tour.latitude===null||tour.longitude===null)return null;return `https://www.openstreetmap.org/?mlat=${tour.latitude}&mlon=${tour.longitude}#map=16/${tour.latitude}/${tour.longitude}`; }
