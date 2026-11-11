import type { Dish } from './model';
import { validateOptions } from './orderOptions';
export type CartSelection = { id: string; dishId: string; quantity: number; variantId?: string; extraIds: string[]; note: string };
export type QuotedLine = CartSelection & { name: string; variantName?: string; extraNames: string[]; unitCents: number; totalCents: number };
/** A quote from the supplied catalog, never from prices supplied by the customer.
 * Checkout must repeat this calculation against the server's published catalog. */
export function quoteRestaurantCart(dishes: Dish[], selections: CartSelection[]) {
  if (selections.length > 100 || new Set(selections.map(line => line.id)).size !== selections.length) throw new Error('Revisa las líneas de tu pedido.');
  const lines: QuotedLine[] = selections.map(line => {
    const dish = dishes.find(item => item.id === line.dishId);
    if (!dish?.available) throw new Error('Un producto ya no está disponible. Retíralo de tu pedido.');
    validateOptions(dish.variants); validateOptions(dish.extras);
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99 || typeof line.note !== 'string' || line.note.length > 300) throw new Error('Usa cantidades de 1 a 99 y notas de hasta 300 caracteres.');
    const variant = dish.variants?.find(option => option.id === line.variantId);
    if ((dish.variants?.length && !variant?.available) || (line.variantId && !variant?.available)) throw new Error(`Elige una presentación disponible de ${dish.name}.`);
    if (!Array.isArray(line.extraIds) || new Set(line.extraIds).size !== line.extraIds.length) throw new Error('Revisa los extras de tu pedido.');
    const extras = line.extraIds.map(id => {
      const extra = dish.extras?.find(option => option.id === id && option.available);
      if (!extra) throw new Error(`Un extra de ${dish.name} ya no está disponible.`);
      return extra;
    });
    const price = variant?.price ?? dish.price;
    if (!Number.isFinite(price) || price < 0 || price > 1_000_000) throw new Error('El negocio necesita revisar el precio de este producto.');
    const unitCents = Math.round(price * 100) + extras.reduce((sum, option) => sum + Math.round(option.price * 100), 0);
    return { ...line, note: line.note.trim(), name: dish.name, variantName: variant?.name, extraNames: extras.map(option => option.name), unitCents, totalCents: unitCents * line.quantity };
  });
  return { lines, totalCents: lines.reduce((sum, line) => sum + line.totalCents, 0) };
}
export function cartWhatsappUrl(phone: string, quote: ReturnType<typeof quoteRestaurantCart>) {
  const number = phone.replace(/\D/g, '');
  if (!/^\d{8,15}$/.test(number)) throw new Error('El negocio debe configurar su WhatsApp.');
  if (!quote.lines.length) throw new Error('Agrega un producto a tu pedido.');
  const text = `Hola, quisiera pedir:\n${quote.lines.map(line => `${line.quantity} × ${line.name}${line.variantName ? ` (${line.variantName})` : ''}${line.extraNames.length ? ` + ${line.extraNames.join(', ')}` : ''} · S/ ${(line.totalCents / 100).toFixed(2)}${line.note ? `\nNota: ${line.note}` : ''}`).join('\n')}\nProductos: S/ ${(quote.totalCents / 100).toFixed(2)}\nPor confirmar: disponibilidad, entrega y pago.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
