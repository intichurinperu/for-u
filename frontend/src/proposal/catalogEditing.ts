import type { ModuleType } from '../modules/moduleProjects';
import { emptyRestaurant, saveDish, type RestaurantData } from '../modules/restaurant/model';
import { emptyEcommerce, saveProduct, type EcommerceData } from '../modules/ecommerce/model';
import { saveRoom, type HospitalityData } from '../modules/hospitality/model';
import { saveTour, type TourismData } from '../modules/tourism/model';
import { saveCourse, type CoursesData } from '../modules/courses/model';
import { nativeOffers, collections } from './model';
import type { Offer } from './model';

export function createNativeProduct(type: ModuleType, payload: unknown, offer: Offer, name: string): unknown | null {
  if (offer.kind !== 'product' || offer.pricing === 'quote' || offer.price === null) return null;
  if (type === 'restaurant') return saveDish((payload as RestaurantData | undefined) ?? emptyRestaurant(name), {
    id: offer.id, name: offer.name, description: offer.description, price: offer.price, image: offer.image,
    category: 'Productos', available: true, conditions: offer.conditions, variants: offer.variants, extras: offer.extras,
  });
  if (type === 'ecommerce' && !offer.variants?.length && !offer.extras?.length) return saveProduct((payload as EcommerceData | undefined) ?? emptyEcommerce(name), {
    id: offer.id, name: offer.name, description: offer.description, price: offer.price, image: offer.image, active: true, stock: 0, category: 'Productos', conditions: offer.conditions,
  });
  return null;
}

export function updateNativePrice(type: ModuleType, payload: unknown, reference: string, price: number): unknown {
  if (!Number.isFinite(price) || price < 0 || price > 1000000) throw new Error('Confirma un precio válido.');
  nativeOffers(type, payload); // Validate the document before touching a single field.
  const id = reference.slice(type.length + 1);
  if (!reference.startsWith(`${type}:`)) throw new Error('La oferta pertenece a otro catálogo.');
  const row = ((payload as Record<string, unknown>)[collections[type]] as {id:string}[]).find(item => item.id === id);
  if (!row) throw new Error('La oferta ya no existe en el catálogo.');
  switch (type) {
    case 'restaurant': { const data = payload as RestaurantData; return saveDish(data, { ...data.dishes.find(d => d.id === id)!, price }); }
    case 'ecommerce': { const data = payload as EcommerceData; return saveProduct(data, { ...data.products.find(d => d.id === id)!, price }); }
    case 'hospitality': { const data = payload as HospitalityData; return saveRoom(data, { ...data.rooms.find(d => d.id === id)!, price }); }
    case 'tourism': { const data = payload as TourismData; return saveTour(data, { ...data.tours.find(d => d.id === id)!, price }); }
    case 'courses': { const data = payload as CoursesData; return saveCourse(data, { ...data.courses.find(d => d.id === id)!, price }); }
  }
}
