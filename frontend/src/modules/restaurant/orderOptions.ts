/** Public catalog options. Variant price replaces base price; extras are added per unit. */
export type DishOption = { id: string; name: string; price: number; available: boolean };
export function validateOptions(value: unknown): asserts value is DishOption[] | undefined {
  if (value === undefined) return; // Existing catalogs remain valid.
  if (!Array.isArray(value) || value.length > 20) throw new Error('Usa hasta 20 opciones por producto.');
  const ids = new Set<string>();
  for (const option of value) {
    if (!option || typeof option.id !== 'string' || !option.id || ids.has(option.id)
      || typeof option.name !== 'string' || !option.name.trim() || option.name.length > 100
      || !Number.isFinite(option.price) || option.price < 0 || option.price > 1_000_000
      || typeof option.available !== 'boolean') throw new Error('Revisa nombres, precios e identificadores de las opciones.');
    ids.add(option.id);
  }
}
export function publicOptions(options: DishOption[] | undefined): DishOption[] | undefined {
  validateOptions(options);
  return options?.map(({ id, name, price, available }) => ({ id, name: name.trim(), price: Math.round(price * 100) / 100, available }));
}
