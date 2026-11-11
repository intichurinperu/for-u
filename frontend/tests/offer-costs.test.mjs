import test from 'node:test';
import assert from 'node:assert/strict';
import {costCategories, costTotals, offerCostsPath, parseOfferCosts, summarizeOfferCosts} from '../src/proposal/offerCosts.ts';
import {islandAreaContent} from '../src/pages/dashboard/islandAreaContent.ts';

test('cost totals keep fractional quantities, zero costs, and pending offers distinct', () => {
  const costs = parseOfferCosts({version: 1, lines: [
    {id: 'a', offerId: 'brownie', category: 'Ingredientes', name: 'Chocolate', quantity: .25, unit: 'kg', unitCents: 1400},
    {id: 'b', offerId: 'cafe', category: 'Compras', name: 'Granos', quantity: .02, unit: 'kg', unitCents: 10000},
    {id: 'c', offerId: 'sample', category: 'Compras', name: 'Muestra', quantity: 1, unit: 'unidad', unitCents: 0},
  ]});
  const rows = summarizeOfferCosts([
    {id: 'brownie', price: 12}, {id: 'cafe', price: 8}, {id: 'sample', price: 0}, {id: 'quote', price: null},
  ], costs);
  assert.deepEqual(rows.map(row => [row.cost, row.difference]), [[350, 850], [200, 600], [0, 0], [null, null]]);
  assert.deepEqual(costTotals(rows.slice(0, 2)), {price: 2000, cost: 550, difference: 1450});
  assert.equal(costTotals(rows).difference, null);
});

test('cost links preserve project and finance origin, and each supported rubro has a logistics destination', () => {
  const url = new URL(offerCostsPath(new URLSearchParams('section=offers&return=island&area=finance&offer=previous'), 'p', 'restaurant:42'), 'https://example.test');
  assert.deepEqual(Object.fromEntries(url.searchParams), {section: 'costs', return: 'island', area: 'finance', project: 'p', costOffer: 'restaurant:42'});
  for (const [route, categories] of Object.entries(costCategories)) {
    assert.ok(categories.length > 1);
    assert.ok(islandAreaContent[route].logistics.primary?.path);
    assert.ok(islandAreaContent[route].operations.description);
  }
});
