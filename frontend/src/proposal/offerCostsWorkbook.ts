import writeExcelFile from 'write-excel-file/universal';
import type {BusinessRoute} from '../workspace/contracts';
import {costLineTotal, costTotals, type OfferCostSummary} from './offerCosts';

const routeLabels: Record<BusinessRoute, string> = {
  restaurant: 'Restaurante', hospitality: 'Hospedaje', tourism: 'Turismo',
  courses: 'Clases y cursos', ecommerce: 'Tienda', services: 'Servicios',
};
const heading = (labels: string[]) => labels.map(value => ({
  value, fontWeight: 'bold' as const, backgroundColor: '#EEE6F4', textColor: '#352941',
}));
const money = (cents: number | null) => cents === null ? null : {value: cents / 100, format: '"S/ " #,##0.00'};

export function offerCostsWorkbook(project: string, route: BusinessRoute, rows: OfferCostSummary[], promotion: OfferCostSummary[]) {
  const totals = costTotals(rows);
  const promoTotals = costTotals(promotion);
  const selected = new Set(promotion.map(row => row.offer.id));
  return writeExcelFile([
    {
      sheet: 'Resumen',
      stickyRowsCount: 6,
      columns: [34, 20, 20, 20, 23, 19].map(width => ({width})),
      data: [
        heading(['Costos y precios · FOR U']),
        ['Proyecto', project],
        ['Rubro', routeLabels[route]],
        ['Moneda', 'PEN'],
        ['Base', 'Una unidad por oferta'],
        heading(['Oferta', 'Estado del precio', 'Precio de venta', 'Costo registrado', 'Precio menos costo', 'En promoción']),
        ...rows.map(row => [
          row.offer.name, row.price === null ? 'Por cotizar' : row.offer.pricing === 'free' ? 'Gratis' : 'Confirmado',
          money(row.price), money(row.cost), money(row.difference), selected.has(row.offer.id) ? 'Sí' : '',
        ]),
        ['Totales registrados del proyecto', null, money(totals.price), money(totals.cost), money(totals.difference)],
        ...(promotion.length ? [['Totales de la selección', null, money(promoTotals.price), money(promoTotals.cost), money(promoTotals.difference)]] : []),
        ['Las celdas vacías indican valores pendientes.'],
      ],
    },
    {
      sheet: 'Detalle de costos',
      stickyRowsCount: 1,
      columns: [34, 22, 38, 13, 16, 21, 19].map(width => ({width})),
      data: [
        heading(['Oferta', 'Categoría', 'Concepto', 'Cantidad', 'Unidad', 'Costo unitario (PEN)', 'Total (PEN)']),
        ...rows.flatMap(row => row.lines.map(line => [
          row.offer.name, line.category, line.name, line.quantity, line.unit, money(line.unitCents), money(costLineTotal(line)),
        ])),
      ],
    },
  ]).toBlob();
}
