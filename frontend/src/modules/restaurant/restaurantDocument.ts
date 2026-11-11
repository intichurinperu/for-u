import type { RestaurantData } from './model';
import { parsePublishedRestaurant } from './publicMenu';

export function parseRestaurantDocument(value: unknown): RestaurantData {
  const data = value as RestaurantData;
  const fail = () => { throw new Error('El documento del restaurante tiene un formato incompatible. Tus datos no se han sobrescrito.'); };
  if (!data || data.version !== 1 || !Array.isArray(data.inventory) || !Array.isArray(data.recipes) || !Array.isArray(data.preparations)) return fail();
  if (!parsePublishedRestaurant({ version: 1, type: 'restaurant', menu: data })) return fail();
  if (data.inventory.some(item => !item || typeof item.id !== 'string' || typeof item.name !== 'string' || !['kg','g','l','ml','unidades'].includes(item.unit) || !Number.isFinite(item.stock) || item.stock < 0 || !Number.isFinite(item.minimum) || item.minimum < 0)) return fail();
  if (data.recipes.some(item => !item || typeof item.id !== 'string' || typeof item.name !== 'string' || !Number.isFinite(item.portions) || item.portions <= 0 || !Array.isArray(item.ingredients) || item.ingredients.some(line => !line || typeof line.ingredientId !== 'string' || !Number.isFinite(line.quantity) || line.quantity <= 0))) return fail();
  if (data.preparations.some(item => !item || typeof item.id !== 'string' || typeof item.recipeId !== 'string' || typeof item.name !== 'string' || typeof item.createdAt !== 'string' || !Number.isFinite(item.batches) || item.batches <= 0)) return fail();
  return data;
}
