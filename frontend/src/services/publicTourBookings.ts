import { supabase } from './supabase';
import type { PublicDeparture, TourBookingReceipt } from '../modules/tourism/tourismPublicationModel';
export class RejectedTourBooking extends Error {}
export async function loadTourDepartures(slug: string): Promise<PublicDeparture[]> {
  if (!supabase) throw new Error('No se pudieron consultar las salidas.');
  const { data, error } = await supabase.rpc('module_tourism_availability', { site_slug: slug });
  if (error || !Array.isArray(data)) throw new Error('No se pudieron consultar las plazas. Reintenta.');
  return data.filter(row => row && ['id','tourId','date','time'].every(key => typeof row[key] === 'string') && Number.isSafeInteger(row.available) && row.available >= 0);
}
export type PublicTourRequest = { departureId: string; customer: string; contact: string; people: number; requestId: string };
export async function reservePublicTour(slug: string, revision: string, request: PublicTourRequest): Promise<TourBookingReceipt> {
  if (!supabase) throw new Error('No se pudo conectar con las reservas.');
  const { data, error } = await supabase.rpc('module_reserve_tour', { site_slug: slug, site_revision: revision, departure_id: request.departureId, customer_name: request.customer, customer_contact: request.contact, party_size: request.people, booking_request: request.requestId });
  if (error) {
    const messages: Record<string, string> = {
      'foru:capacity': 'Ya no quedan suficientes plazas. Actualiza las salidas y elige otra fecha.',
      'foru:unavailable': 'Esta salida ya no está disponible. Actualiza las salidas.',
      'foru:stale': 'La experiencia se actualizó. Recarga la página y revisa el precio antes de reservar.',
      'foru:invalid': 'Completa nombre, contacto y una cantidad válida de personas.',
      'foru:duplicate': 'Ya existe una reserva con ese contacto para esta salida. Contacta con la agencia para modificarla.',
      'foru:request_conflict': 'Esta solicitud ya se usó con otros datos o fue cancelada. Contacta con la agencia antes de repetirla.',
    };
    if (messages[error.message]) throw new RejectedTourBooking(messages[error.message]);
    throw new Error('No pudimos confirmar el resultado. Conserva estos datos y reintenta la misma solicitud para evitar duplicarla.');
  }
  if (!data || typeof data.bookingId !== 'string' || !Number.isSafeInteger(data.people) || !Number.isFinite(data.total) || data.currency !== 'PEN') throw new Error('No se pudo leer la confirmación. Reintenta con los mismos datos.');
  return data;
}
