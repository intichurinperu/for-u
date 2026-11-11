import { validateOptions, publicOptions, type DishOption } from './orderOptions';
export type Dish = {
  id: string; name: string; description: string; category: string;
  price: number; image: string; available: boolean;
  variants?: DishOption[]; extras?: DishOption[]; conditions?: string;
};
export type Ingredient = {
  id: string; name: string; unit: 'kg' | 'g' | 'l' | 'ml' | 'unidades';
  stock: number; minimum: number;
};
export type Recipe = {
  id: string; name: string; portions: number;
  ingredients: Array<{ ingredientId: string; quantity: number }>;
};
export type MenuSection = {
  id: 'hero' | 'menu' | 'about' | 'faq' | 'location' | 'loyalty';
  title: string; visible: boolean;
};
export type RestaurantData = {
  presentationVersion?: import('../../presentation/model').PresentationVersion;
  version: 1;
  dishes: Dish[]; inventory: Ingredient[]; recipes: Recipe[];
  preparations: Array<{ id: string; recipeId: string; name: string; batches: number; createdAt: string }>;
  sections: MenuSection[];
  settings: {
    title: string; tagline: string; coverImage: string; about: string;
    address: string; hours: string; whatsapp: string; loyalty: string;
    faq: Array<{ id: string; question: string; answer: string }>;
  };
};

export function emptyRestaurant(name: string): RestaurantData {
  return {
    version: 1, dishes: [], inventory: [], recipes: [], preparations: [],
    sections: [
      { id: 'hero', title: 'Portada', visible: true },
      { id: 'menu', title: 'Menú', visible: true },
      { id: 'about', title: 'Conócenos', visible: true },
      { id: 'faq', title: 'Preguntas frecuentes', visible: true },
      { id: 'location', title: 'Ubicación', visible: true },
      { id: 'loyalty', title: 'Fidelización', visible: true },
    ],
    settings: { title: name, tagline: '', coverImage: '', about: '', address: '', hours: '', whatsapp: '', loyalty: '', faq: [] },
  };
}

function nonnegative(value: number) { return Number.isFinite(value) && value >= 0; }
function positive(value: number) { return Number.isFinite(value) && value > 0; }

export function validateDish(dish: Dish) {
  if (!dish.name.trim()) throw new Error('Escribe el nombre del plato.');
  validateOptions(dish.variants); validateOptions(dish.extras);
  if (!nonnegative(dish.price) || dish.price > 1_000_000) throw new Error('El precio debe ser cero o mayor.');
}

export function saveDish(data: RestaurantData, dish: Dish): RestaurantData {
  validateDish(dish);
  const clean = { ...dish, name: dish.name.trim(), price: Math.round(dish.price * 100) / 100, ...(dish.variants ? { variants: publicOptions(dish.variants) } : {}), ...(dish.extras ? { extras: publicOptions(dish.extras) } : {}) };
  return { ...data, dishes: data.dishes.some(item => item.id === dish.id)
    ? data.dishes.map(item => item.id === dish.id ? clean : item) : [...data.dishes, clean] };
}

export function saveIngredient(data: RestaurantData, ingredient: Ingredient): RestaurantData {
  if (!ingredient.name.trim() || !nonnegative(ingredient.stock) || !nonnegative(ingredient.minimum)) {
    throw new Error('Completa el nombre y usa cantidades iguales o mayores a cero.');
  }
  const previous = data.inventory.find(item => item.id === ingredient.id);
  if (previous && previous.unit !== ingredient.unit && data.recipes.some(recipe => recipe.ingredients.some(row => row.ingredientId === ingredient.id))) {
    throw new Error('Este ingrediente se usa en recetas. Conserva su unidad o crea otro ingrediente.');
  }
  return { ...data, inventory: previous
    ? data.inventory.map(item => item.id === ingredient.id ? ingredient : item)
    : [...data.inventory, ingredient] };
}

export function validateRecipe(data: RestaurantData, recipe: Recipe) {
  if (!recipe.name.trim() || !Number.isInteger(recipe.portions) || recipe.portions < 1) throw new Error('Escribe un nombre y al menos una porción por lote.');
  if (!recipe.ingredients.length) throw new Error('Agrega al menos un ingrediente.');
  for (const row of recipe.ingredients) {
    if (!positive(row.quantity)) throw new Error('Cada ingrediente necesita una cantidad mayor a cero.');
    if (!data.inventory.some(item => item.id === row.ingredientId)) throw new Error('Un ingrediente ya no existe en el inventario.');
  }
}

export function preparationImpact(data: RestaurantData, recipe: Recipe, batches: number) {
  validateRecipe(data, recipe);
  if (!Number.isInteger(batches) || batches < 1) throw new Error('Prepara al menos un lote completo.');
  // Aggregate repeated ingredients before checking stock, including across recipe rows.
  const required = new Map<string, number>();
  for (const row of recipe.ingredients) required.set(row.ingredientId, (required.get(row.ingredientId) ?? 0) + row.quantity * batches);
  return [...required].map(([id, quantity]) => {
    const item = data.inventory.find(ingredient => ingredient.id === id)!;
    const remaining = Math.round((item.stock - quantity) * 1e6) / 1e6;
    return { id, name: item.name, unit: item.unit, stock: item.stock, required: quantity, remaining };
  });
}

export function prepareRecipe(data: RestaurantData, recipeId: string, batches: number, operationId: string, now = new Date().toISOString()): RestaurantData {
  if (!operationId) throw new Error('Falta identificar esta preparación.');
  if (data.preparations.some(item => item.id === operationId)) return data;
  const recipe = data.recipes.find(item => item.id === recipeId);
  if (!recipe) throw new Error('No se encontró la receta.');
  const impact = preparationImpact(data, recipe, batches);
  if (impact.some(row => row.remaining < 0)) throw new Error('No hay suficiente inventario. Reduce los lotes o repón los ingredientes.');
  return {
    ...data,
    inventory: data.inventory.map(item => {
      const row = impact.find(value => value.id === item.id);
      return row ? { ...item, stock: row.remaining } : item;
    }),
    preparations: [...data.preparations, { id: operationId, recipeId, name: recipe.name, batches, createdAt: now }],
  };
}

export function moveSection(data: RestaurantData, id: MenuSection['id'], direction: -1 | 1): RestaurantData {
  const index = data.sections.findIndex(section => section.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= data.sections.length) return data;
  const sections = [...data.sections];
  [sections[index], sections[target]] = [sections[target], sections[index]];
  return { ...data, sections };
}

export function whatsappOrderUrl(phone: string, lines: Array<{ dish: Dish; quantity: number }>) {
  const number = phone.replace(/[^0-9]/g, '');
  if (!/^\d{8,15}$/.test(number)) throw new Error('Configura el número de WhatsApp con código de país.');
  if (!lines.length || lines.some(line => !line.dish.available || !Number.isInteger(line.quantity) || line.quantity < 1 || !nonnegative(line.dish.price))) throw new Error('Selecciona platos disponibles y cantidades válidas.');
  const total = lines.reduce((sum, line) => sum + Math.round(line.dish.price * 100) * line.quantity, 0) / 100;
  const text = `Hola, quisiera pedir:\n${lines.map(line => `${line.quantity} × ${line.dish.name}`).join('\n')}\nTotal: S/ ${total.toFixed(2)}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
