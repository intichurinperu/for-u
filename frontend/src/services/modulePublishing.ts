import { supabase } from './supabase';
import { externalImageUrl, isPrivateMedia, privateMediaPath } from '../components/shared/mediaReference';
import { isRestaurantSlug } from '../modules/validationLaunch';
import { restaurantSnapshot } from '../modules/restaurant/publicMenu';
import type { RestaurantData } from '../modules/restaurant/model';
import type { TourismData } from '../modules/tourism/model';
import { tourismSnapshot } from '../modules/tourism/tourismPublicationModel';
type PublishedModule = 'restaurant' | 'tourism';
export type ModulePublication = { slug: string; published: boolean; revision: string };
function client() { if (!supabase) throw new Error('Conecta tu cuenta para publicar.'); return supabase; }
export function validatePublicationSlug(slug: string) {
  if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(slug)) throw new Error('Usa entre 3 y 60 letras minúsculas, números o guiones para el enlace.');
}
async function loadPublication(userId: string, projectId: string, type: PublishedModule): Promise<ModulePublication | null> {
  const { data, error } = await client().from('module_sites').select('slug,published,revision').eq('user_id', userId).eq('project_id', projectId).eq('module_type', type).maybeSingle();
  if (error) throw new Error('No se pudo comprobar la publicación. Reintenta o revisa la configuración de publicación de tu cuenta.');
  return data;
}
export function imagePublisher(userId: string, projectId: string) {
  const db = client();
  const images = new Map<string, Promise<string>>();
  function publicImage(value: string): Promise<string> {
    if (!value) return Promise.resolve('');
    if (!isPrivateMedia(value)) { const url = externalImageUrl(value); if (!url) return Promise.reject(new Error('Revisa los enlaces de las imágenes.')); return Promise.resolve(url); }
    const path = privateMediaPath(value, userId, projectId);
    if (!path) return Promise.reject(new Error('Una imagen pertenece a otro proyecto. Vuelve a elegirla.'));
    if (!images.has(path)) images.set(path, (async () => {
      const download = await db.storage.from('user-uploads').download(path);
      if (download.error || !download.data) throw new Error('No se pudo preparar una imagen. La publicación anterior sigue disponible.');
      const blob = download.data;
      const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[blob.type];
      if (!extension || blob.size > 5 * 1024 * 1024) throw new Error('Las fotos públicas deben ser JPG, PNG o WebP de hasta 5 MB.');
      const destination = `${userId}/${projectId}/modules/${crypto.randomUUID()}.${extension}`;
      const uploaded = await db.storage.from('site-assets').upload(destination, blob, { contentType: blob.type, upsert: false });
      if (uploaded.error) throw new Error('No se pudo publicar una foto. Reintenta la publicación.');
      return db.storage.from('site-assets').getPublicUrl(destination).data.publicUrl;
    })());
    return images.get(path)!;
  }
  return publicImage;
}
export async function publishRestaurant(userId: string, projectId: string, data: RestaurantData, slug: string, previous: ModulePublication | null): Promise<ModulePublication> {
  validatePublicationSlug(slug);
  if (!isRestaurantSlug(slug)) throw new Error('Ese enlace está reservado para la app. Elige otro nombre para tu negocio.');
  const content = restaurantSnapshot(data);
  const publicImage = imagePublisher(userId, projectId);
  content.menu.settings.coverImage = await publicImage(content.menu.settings.coverImage);
  for (const dish of content.menu.dishes) dish.image = await publicImage(dish.image);
  return persistPublication(userId, projectId, 'restaurant', slug, content, previous);
}
export async function publishTourism(userId: string, projectId: string, data: TourismData, slug: string, previous: ModulePublication | null): Promise<ModulePublication> {
  validatePublicationSlug(slug);
  const content = tourismSnapshot(data);
  const publicImage = imagePublisher(userId, projectId);
  for (const tour of content.tours) tour.image = await publicImage(tour.image);
  return persistPublication(userId, projectId, 'tourism', slug, content, previous);
}
async function persistPublication(userId: string, projectId: string, type: PublishedModule, slug: string, content: unknown, previous: ModulePublication | null): Promise<ModulePublication> {
  const db = client();
  if (new TextEncoder().encode(JSON.stringify(content)).length > 60000) throw new Error('La página es demasiado grande. Reduce los textos antes de publicar.');
  const values = { slug, content, published: true, revision: crypto.randomUUID(), updated_at: new Date().toISOString() };
  const result = previous
    ? await db.from('module_sites').update(values).eq('user_id', userId).eq('project_id', projectId).eq('module_type', type).eq('revision', previous.revision).select('slug,published,revision').maybeSingle()
    : await db.from('module_sites').insert({ ...values, user_id: userId, project_id: projectId, module_type: type }).select('slug,published,revision').single();
  if (result.error?.code === '23505') throw new Error('Ese enlace ya está ocupado o este proyecto se publicó desde otra ventana. Revisa el estado y elige otro enlace si hace falta.');
  if (result.error) throw new Error('No se pudo confirmar la publicación. Revisa su estado antes de reintentar.');
  if (!result.data) throw new Error('La publicación cambió en otra ventana. Revisa su estado antes de continuar.');
  return result.data;
}
async function unpublish(userId: string, projectId: string, type: PublishedModule, previous: ModulePublication): Promise<ModulePublication> {
  const { data, error } = await client().from('module_sites').update({ published: false, revision: crypto.randomUUID(), updated_at: new Date().toISOString() }).eq('user_id', userId).eq('project_id', projectId).eq('module_type', type).eq('revision', previous.revision).select('slug,published,revision').maybeSingle();
  if (error || !data) throw new Error('No se pudo retirar la página. Revisa el estado y vuelve a intentar.');
  return data;
}

export const loadRestaurantPublication = (userId: string, projectId: string) => loadPublication(userId, projectId, 'restaurant');
export const loadTourismPublication = (userId: string, projectId: string) => loadPublication(userId, projectId, 'tourism');
export const unpublishRestaurant = (userId: string, projectId: string, previous: ModulePublication) => unpublish(userId, projectId, 'restaurant', previous);
export const unpublishTourism = (userId: string, projectId: string, previous: ModulePublication) => unpublish(userId, projectId, 'tourism', previous);
