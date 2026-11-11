import type {BusinessRoute} from '../workspace/contracts';
import type {Offer} from './model';

export const costCategories = {
  restaurant: ['Ingredientes', 'Compras', 'Merma'],
  hospitality: ['Limpieza', 'Mantenimiento', 'Insumos'],
  tourism: ['Tiempo', 'Transporte', 'Recursos'],
  courses: ['Materiales', 'Plataforma', 'Producción digital'],
  ecommerce: ['Compras', 'Inventario', 'Embalaje'],
  services: ['Horas de trabajo', 'Materiales', 'Recursos'],
} satisfies Record<BusinessRoute, string[]>;

export type CostLine = {
  id: string;
  offerId: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  unitCents: number;
};
export type OfferCosts = {version: 1; lines: CostLine[]};
export const emptyOfferCosts = (): OfferCosts => ({version: 1, lines: []});

export function parseOfferCosts(value: unknown): OfferCosts {
  const doc = value as OfferCosts;
  const validText = (text: unknown, max: number) => typeof text === 'string' && text.trim().length > 0 && text.length <= max;
  if (doc?.version !== 1 || !Array.isArray(doc.lines) || doc.lines.length > 1000 ||
    doc.lines.some(line => !line || !validText(line.id, 80) || !validText(line.offerId, 200) ||
      !validText(line.name, 120) || !validText(line.category, 60) || !validText(line.unit, 40) ||
      !Number.isFinite(line.quantity) || line.quantity < .001 || line.quantity > 10000 ||
      !Number.isInteger(line.unitCents) || line.unitCents < 0 || line.unitCents > 100000000) ||
    new Set(doc.lines.map(line => line.id)).size !== doc.lines.length) {
    throw new Error('Revisa el concepto, la unidad, la cantidad y el costo unitario.');
  }
  return doc;
}

export function costLineTotal(line: CostLine) {
  return Math.round(Math.round(line.quantity * 1000) * line.unitCents / 1000);
}

export function summarizeOfferCosts(offers: Offer[], costs: OfferCosts) {
  return offers.map(offer => {
    const lines = costs.lines.filter(line => line.offerId === offer.id);
    const price = offer.price === null ? null : Math.round(offer.price * 100);
    const cost = lines.length ? lines.reduce((sum, line) => sum + costLineTotal(line), 0) : null;
    return {offer, lines, price, cost, difference: price !== null && cost !== null ? price - cost : null};
  });
}

export type OfferCostSummary = ReturnType<typeof summarizeOfferCosts>[number];
export function costTotals(rows: OfferCostSummary[]) {
  const price = rows.reduce((sum, row) => sum + (row.price ?? 0), 0);
  const cost = rows.reduce((sum, row) => sum + (row.cost ?? 0), 0);
  const complete = rows.length > 0 && rows.every(row => row.difference !== null);
  return {price, cost, difference: complete ? price - cost : null};
}

const currency = new Intl.NumberFormat('es-PE', {style: 'currency', currency: 'PEN'});
export const costMoney = (cents: number | null) => cents === null ? 'Pendiente' : currency.format(cents / 100);

export function offerCostsPath(params: URLSearchParams, project: string, offerId?: string) {
  const next = new URLSearchParams(params);
  next.set('project', project);
  next.set('section', 'costs');
  next.delete('offer');
  if (offerId) next.set('costOffer', offerId);
  else next.delete('costOffer');
  return '/dashboard/tools/proposal?' + next;
}
