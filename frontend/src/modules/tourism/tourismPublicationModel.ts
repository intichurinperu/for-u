import {validTourLocation} from './model';
import {presentationVersion} from '../../presentation/model';
import type { TourismData, Tour } from './model';
export const tourTimeZones = ['America/Lima', 'America/Bogota', 'America/Mexico_City', 'America/Argentina/Buenos_Aires', 'Europe/Madrid', 'UTC'] as const;
export type PublishedTourism = { presentationVersion?: import('../../presentation/model').PresentationVersion; version: 1; type: 'tourism'; settings: { name: string; about: string; whatsapp: string; timeZone: string }; tours: Tour[] };
export type PublicDeparture = { id: string; tourId: string; date: string; time: string; available: number };
export type TourBookingReceipt = { bookingId: string; people: number; total: number; currency: 'PEN' };
export function tourismSnapshot(data: TourismData): PublishedTourism {
  if (!data.settings.name.trim()) throw new Error('Escribe el nombre de tu agencia.');
  const timeZone = data.settings.timeZone ?? 'America/Lima';
  if (!tourTimeZones.some(zone => zone === timeZone)) throw new Error('Selecciona la zona horaria de tus salidas.');
  const tours = data.tours.filter(tour => tour.active).map(tour => {
    if (!tour.name.trim() || !Number.isFinite(tour.price) || tour.price < 0 || !Number.isInteger(tour.durationMinutes) || tour.durationMinutes < 1 || !validTourLocation(tour)) throw new Error('Revisa nombre, precio, duración y ubicación de tus experiencias.');
    return { id: tour.id, name: tour.name.trim(), description: tour.description, price: Math.round(tour.price * 100) / 100, durationMinutes: tour.durationMinutes, image: tour.image, active: true, meetingPoint: tour.meetingPoint, latitude: tour.latitude, longitude: tour.longitude, itinerary: tour.itinerary.map(stop => ({ id: stop.id, title: stop.title, description: stop.description })) };
  });
  if (!tours.length) throw new Error('Activa al menos una experiencia antes de publicar.');
  return { ...(data.presentationVersion!==undefined?{presentationVersion:presentationVersion(data.presentationVersion)}:{}), version: 1, type: 'tourism', settings: { name: data.settings.name.trim(), about: data.settings.about, whatsapp: data.settings.whatsapp, timeZone }, tours };
}
export function parsePublishedTourism(value: unknown): PublishedTourism | null {
  try {
    const data = value as PublishedTourism;
    if (!data || data.version !== 1 || data.type !== 'tourism' || !data.settings || !Array.isArray(data.tours)) return null;
    if (![data.settings.name, data.settings.about, data.settings.whatsapp, data.settings.timeZone].every(v => typeof v === 'string')) return null;
    for (const tour of data.tours) {
      if (!tour || ![tour.id,tour.name,tour.description,tour.image,tour.meetingPoint].every(v => typeof v === 'string') || !Array.isArray(tour.itinerary) || typeof tour.active !== 'boolean') return null;
      if (tour.itinerary.some(stop => !stop || ![stop.id,stop.title,stop.description].every(v => typeof v === 'string'))) return null;
    }
    if (new Set(data.tours.map(tour => tour.id)).size !== data.tours.length) return null;
    return tourismSnapshot({ presentationVersion:data.presentationVersion,version: 1, settings: data.settings, tours: data.tours, departures: [], guides: [], bookings: [] });
  } catch { return null; }
}
