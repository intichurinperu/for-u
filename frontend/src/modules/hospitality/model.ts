import { dayNumber, nightsBetween } from '../dates.ts';

export type Room = {
  id: string; name: string; type: string; price: number; capacity: number;
  image: string; status: 'clean' | 'dirty' | 'maintenance'; amenities: string[];
};
export type Booking = {
  id: string; roomId: string; guest: string; contact: string; guests: number;
  checkIn: string; checkOut: string; nightlyRate: number; total: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'; notes: string;
};
export type FinanceEntry = {
  id: string; type: 'income' | 'expense'; concept: string; amount: number; date: string; bookingId?: string;
};
export type HospitalityData = {
  version: 1; rooms: Room[]; bookings: Booking[]; finances: FinanceEntry[];
  sections: Array<{ id: string; title: string; visible: boolean }>;
  settings: {
    name: string; tagline: string; about: string; whatsapp: string; email: string;
    address: string; checkIn: string; checkOut: string; heroImage: string;
    faqs: Array<{ id: string; question: string; answer: string }>;
    promotions: Array<{ id: string; title: string; description: string; active: boolean }>;
  };
};
export function emptyHospitality(name: string): HospitalityData {
  return { version: 1, rooms: [], bookings: [], finances: [],
    sections: [['hero', 'Portada'], ['about', 'Quiénes somos'], ['rooms', 'Habitaciones'], ['promotions', 'Promociones'], ['faq', 'Preguntas frecuentes'], ['contact', 'Contacto']].map(([id, title]) => ({ id, title, visible: true })),
    settings: { name, tagline: '', about: '', whatsapp: '', email: '', address: '', checkIn: '15:00', checkOut: '11:00', heroImage: '', faqs: [], promotions: [] } };
}
const nonnegative = (value: number) => Number.isFinite(value) && value >= 0;
const money = (value: number) => Math.round(value * 100) / 100;
export const occupiesRoom = (booking: Booking) => booking.status !== 'cancelled';

export function saveRoom(data: HospitalityData, room: Room): HospitalityData {
  if (!room.name.trim() || !nonnegative(room.price) || !Number.isInteger(room.capacity) || room.capacity < 1) throw new Error('Completa nombre, precio válido y capacidad de al menos una persona.');
  if (data.bookings.some(booking => booking.roomId === room.id && ['pending', 'confirmed', 'checked-in'].includes(booking.status) && booking.guests > room.capacity)) throw new Error('La capacidad no puede ser menor a la de una reserva activa.');
  const value = { ...room, price: money(room.price), name: room.name.trim(), amenities: [...new Set(room.amenities.map(item => item.trim()).filter(Boolean))] };
  return { ...data, rooms: data.rooms.some(item => item.id === room.id) ? data.rooms.map(item => item.id === room.id ? value : item) : [...data.rooms, value] };
}
export function removeRoom(data: HospitalityData, id: string): HospitalityData {
  if (data.bookings.some(booking => booking.roomId === id)) throw new Error('Esta habitación tiene historial de reservas. Consérvala y marca mantenimiento si ya no la ofreces.');
  return { ...data, rooms: data.rooms.filter(room => room.id !== id) };
}
export function saveBooking(data: HospitalityData, booking: Booking): HospitalityData {
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const room = data.rooms.find(item => item.id === booking.roomId);
  if (!room) throw new Error('Selecciona una habitación existente.');
  if (!booking.guest.trim() || !Number.isInteger(booking.guests) || booking.guests < 1 || booking.guests > room.capacity) throw new Error('Completa el huésped y respeta la capacidad de la habitación.');
  if (!nonnegative(booking.nightlyRate)) throw new Error('La tarifa por noche debe ser cero o mayor.');
  const previous = data.bookings.find(item => item.id === booking.id);
  if (previous && ['checked-out', 'cancelled'].includes(previous.status)) throw new Error('La reserva está cerrada. Conserva su historial y crea una nueva si es necesario.');
  if (occupiesRoom(booking)) {
    if (room.status === 'maintenance') throw new Error('La habitación está en mantenimiento.');
    if (data.bookings.some(item => item.id !== booking.id && item.roomId === booking.roomId && occupiesRoom(item) && item.checkIn < booking.checkOut && item.checkOut > booking.checkIn)) throw new Error('La habitación ya tiene una reserva en esas fechas.');
  }
  const clean = { ...booking, guest: booking.guest.trim(), nightlyRate: money(booking.nightlyRate), total: money(nights * money(booking.nightlyRate)) };
  return { ...data, bookings: previous ? data.bookings.map(item => item.id === booking.id ? clean : item) : [...data.bookings, clean] };
}
export function changeBookingStatus(data: HospitalityData, id: string, status: Booking['status']): HospitalityData {
  const booking = data.bookings.find(item => item.id === id);
  if (!booking) throw new Error('No se encontró la reserva.');
  const allowed: Record<Booking['status'], Booking['status'][]> = { pending: ['confirmed', 'cancelled'], confirmed: ['checked-in', 'cancelled'], 'checked-in': ['checked-out'], 'checked-out': [], cancelled: [] };
  if (!allowed[booking.status].includes(status)) throw new Error('Ese cambio no corresponde al estado actual de la reserva.');
  const room = data.rooms.find(item => item.id === booking.roomId);
  if (status === 'checked-in' && room?.status !== 'clean') throw new Error('Antes del ingreso, la habitación debe estar limpia.');
  return { ...data, bookings: data.bookings.map(item => item.id === id ? { ...item, status } : item),
    rooms: status === 'checked-out' ? data.rooms.map(item => item.id === booking.roomId ? { ...item, status: 'dirty' } : item) : data.rooms };
}
export function saveFinanceEntry(data: HospitalityData, entry: FinanceEntry): HospitalityData {
  dayNumber(entry.date);
  if (!entry.concept.trim() || !Number.isFinite(entry.amount) || entry.amount <= 0 || !['income', 'expense'].includes(entry.type)) throw new Error('Completa concepto y un monto mayor a cero.');
  if (entry.bookingId && !data.bookings.some(booking => booking.id === entry.bookingId)) throw new Error('La reserva asociada no existe.');
  const value = { ...entry, concept: entry.concept.trim(), amount: money(entry.amount) };
  return { ...data, finances: data.finances.some(item => item.id === entry.id) ? data.finances.map(item => item.id === entry.id ? value : item) : [...data.finances, value] };
}
export function hospitalitySummary(data: HospitalityData, date: string) {
  dayNumber(date);
  const occupiedIds = new Set(data.bookings.filter(booking => occupiesRoom(booking) && booking.checkIn <= date && booking.checkOut > date).map(booking => booking.roomId));
  const month = date.slice(0, 7);
  const entries = data.finances.filter(entry => entry.date.startsWith(month));
  const income = money(entries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0));
  const expense = money(entries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0));
  return { occupied: occupiedIds.size, available: data.rooms.filter(room => room.status === 'clean' && !occupiedIds.has(room.id)).length, income, expense, profit: money(income - expense) };
}
