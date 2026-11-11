import {presentationVersion} from '../../presentation/model';
import { publicOptions, validateOptions } from './orderOptions';
import type { RestaurantData } from './model';
export type RestaurantMenuData = Pick<RestaurantData, 'dishes' | 'sections' | 'settings' | 'presentationVersion'>;
export type PublishedRestaurant = { version: 1; type: 'restaurant'; menu: RestaurantMenuData };

export function restaurantSnapshot(data: RestaurantData): PublishedRestaurant {
  if (!data.settings.title.trim()) throw new Error('Escribe el nombre del restaurante antes de publicar.');
  const visible = new Set(data.sections.filter(section => section.visible).map(section => section.id));
  if (!visible.has('menu')) throw new Error('Activa la sección Menú antes de publicar la carta.');
  const phone = data.settings.whatsapp.replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(phone)) throw new Error('Configura WhatsApp con código de país para recibir pedidos.');
  const dishes = data.dishes.filter(dish => dish.available).map(dish => {
    if (!dish.name.trim() || !Number.isFinite(dish.price) || dish.price < 0) throw new Error('Revisa los nombres y precios de los platos.');
    return { id: dish.id, name: dish.name.trim(), description: dish.description, category: dish.category, price: Math.round(dish.price * 100) / 100, image: dish.image, available: true, ...(dish.variants ? { variants: publicOptions(dish.variants) } : {}), ...(dish.extras ? { extras: publicOptions(dish.extras) } : {}) };
  });
  if (!dishes.length) throw new Error('Agrega al menos un plato disponible antes de publicar.');
  const s = data.settings;
  return { version: 1, type: 'restaurant', menu: {
    ...(data.presentationVersion!==undefined?{presentationVersion:presentationVersion(data.presentationVersion)}:{}),
    dishes,
    sections: data.sections.filter(section => section.visible).map(section => ({ id: section.id, title: section.title, visible: true })),
    settings: { title: s.title.trim(), whatsapp: phone, tagline: visible.has('hero') ? s.tagline : '', coverImage: visible.has('hero') ? s.coverImage : '', about: visible.has('about') ? s.about : '', address: visible.has('location') ? s.address : '', hours: visible.has('location') ? s.hours : '', loyalty: visible.has('loyalty') ? s.loyalty : '', faq: visible.has('faq') ? s.faq.filter(item => item.question.trim()).map(item => ({ id: item.id, question: item.question, answer: item.answer })) : [] },
  } };
}

export function parsePublishedRestaurant(value: unknown): PublishedRestaurant | null {
  try {
    if (!value || typeof value !== 'object') return null;
    const raw = value as PublishedRestaurant;
    if (raw.version !== 1 || raw.type !== 'restaurant' || !raw.menu) return null;
    presentationVersion(raw.menu.presentationVersion);
    const { dishes, settings, sections } = raw.menu;
    const text = (v: unknown) => typeof v === 'string';
    if (!settings || !['title','whatsapp','tagline','coverImage','about','address','hours','loyalty'].every(key => text(settings[key as keyof typeof settings]))) return null;
    if (!Array.isArray(settings.faq) || settings.faq.some(item => !item || ![item.id,item.question,item.answer].every(text))) return null;
    if (!Array.isArray(dishes) || dishes.some(dish => !dish || ![dish.id,dish.name,dish.description,dish.category,dish.image].every(text) || !Number.isFinite(dish.price) || dish.price < 0 || typeof dish.available !== 'boolean')) return null;
    for (const dish of dishes) { validateOptions(dish.variants); validateOptions(dish.extras); }
    if (!Array.isArray(sections) || sections.some(section => !section || !['hero','menu','about','faq','location','loyalty'].includes(section.id) || !text(section.title) || typeof section.visible !== 'boolean')) return null;
    if (new Set(dishes.map(dish => dish.id)).size !== dishes.length || new Set(sections.map(section => section.id)).size !== sections.length) return null;
    return raw;
  } catch { return null; }
}
