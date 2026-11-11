import type { ModuleType } from './moduleProjects';

/**
 * During the exploration phase every vertical is available.  This policy is
 * intentionally separate from the commercial plan: changing a subscription
 * must not make a user's existing workspace disappear.
 */
export function isModuleEnabled(type: ModuleType | null): boolean {
  return type !== null;
}

export const explorationProjectsAreUnlimited = true;

const reservedSlugs = new Set([
  'ia', 'metodologia', 'mundo-digital', 'aventura', 'workspace', 'modules',
  'content-creator', 'negocio', 'experiencias', 'herramientas', 'mapa',
  'site-preview', 's', 'whatsapp', 'pricing', 'studio', 'login', 'register',
  'register-wizard', 'dashboard', 'editor', 'reservas', 'p', 'api', 'assets',
  'pedidos', 'compras', 'cobros', 'demo', 'terminos', 'privacidad',
]);
export function isRestaurantSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,59}$/.test(slug) && !reservedSlugs.has(slug);
}
export function suggestRestaurantSlug(name: string): string {
  const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '');
  return isRestaurantSlug(slug) ? slug : 'mi-restaurante';
}
export function restaurantPublicPath(slug: string): string {
  // Old reserved slugs remain accessible using the original URL.
  return isRestaurantSlug(slug) ? `/${slug}` : `/negocio/${encodeURIComponent(slug)}`;
}
