import type { ModuleType } from '../modules/moduleProjects';

const collections: Record<ModuleType, string> = {restaurant:'dishes',ecommerce:'products',hospitality:'rooms',tourism:'tours',courses:'courses'};
/** Public snapshot deliberately excludes costs, stock, contacts and customer records. */
export function catalogSnapshot(type: ModuleType, payload: unknown, limit = 30): Array<{id: string; name: string; price: number}> {
  if (!payload || typeof payload !== 'object') throw new Error('Guarda primero tu catálogo en el módulo del negocio.');
  const document = payload as Record<string, unknown>;
  const entries = document[collections[type]];
  if (document.version !== 1 || !Array.isArray(entries)) throw new Error('No pudimos leer el catálogo guardado. No se ha reemplazado tu página.');
  const visible = entries.filter(item => item && item.available !== false && item.active !== false && item.status !== 'maintenance');
  if (visible.length > limit) throw new Error('Esta landing admite hasta 30 ofertas. Usa el menú del módulo para publicar un catálogo mayor.');
  const ids = new Set<string>();
  return visible.map(item => {
    if (typeof item.id !== 'string' || !item.id || ids.has(item.id) || typeof item.name !== 'string' || !item.name.trim() || typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0 || item.price > 1000000) throw new Error('Revisa los nombres y precios de tu catálogo antes de publicarlo.');
    ids.add(item.id);
    return { id:item.id, name:item.name.trim(), price:Math.round(item.price * 100) / 100 };
  });
}
