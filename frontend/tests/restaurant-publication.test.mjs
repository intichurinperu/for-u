import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyRestaurant } from '../src/modules/restaurant/model.ts';
import { restaurantSnapshot, parsePublishedRestaurant } from '../src/modules/restaurant/publicMenu.ts';
function fixture() {
  const data = emptyRestaurant('Café de prueba');
  data.settings.whatsapp = '+51 999 888 777';
  data.dishes = [{ id: 'coffee', name: 'Café', description: 'Café filtrado', category: 'Bebidas', price: 5.5, image: '', available: true }];
  return data;
}
test('published menu contains only explicit public fields, never inventory or recipe data', () => {
  const data = fixture();
  data.inventory = [{ id: 'secret', name: 'Costo privado', stock: 12, minimum: 1, unit: 'kg' }];
  data.internalNote = 'No publicar'; data.dishes[0].supplierCost = 2;
  const before = structuredClone(data);
  const snapshot = restaurantSnapshot(data);
  assert.deepEqual(Object.keys(snapshot.menu).sort(), ['dishes','sections','settings']);
  assert.equal(JSON.stringify(snapshot).includes('Costo privado'), false);
  assert.equal(JSON.stringify(snapshot).includes('supplierCost'), false);
  assert.equal(JSON.stringify(snapshot).includes('No publicar'), false);
  assert.deepEqual(data, before);
  assert.equal(snapshot.menu.settings.whatsapp, '51999888777');
});
test('hidden sections and unavailable products are absent from the public snapshot', () => {
  const data = fixture(); data.sections.find(section => section.id === 'about').visible = false;
  data.sections.find(section => section.id === 'hero').visible = false;
  data.settings.about = 'Historia aún en borrador'; data.settings.coverImage = 'foru-media:owner/project/private.jpg';
  data.dishes.push({ ...data.dishes[0], id: 'hidden', name: 'Plato en prueba', available: false });
  const snapshot = restaurantSnapshot(data);
  assert.equal(snapshot.menu.dishes.length, 1);
  assert.equal(snapshot.menu.settings.about, ''); assert.equal(snapshot.menu.settings.coverImage, '');
  assert.equal(snapshot.menu.sections.some(section => !section.visible || section.id === 'about'), false);
});
test('publication requires a usable menu, valid contact and valid prices', () => {
  for (const modify of [data => data.settings.whatsapp = '', data => data.dishes = [], data => data.settings.title = '', data => data.dishes[0].price = NaN, data => data.sections.find(section => section.id === 'menu').visible = false]) {
    const data = fixture(); modify(data); assert.throws(() => restaurantSnapshot(data));
  }
});
test('public reader rejects malformed records and duplicate identifiers', () => {
  const snapshot = restaurantSnapshot(fixture()); assert.deepEqual(parsePublishedRestaurant(snapshot), snapshot);
  for (const value of [null, {}, { ...snapshot, version: 2 }, { ...snapshot, menu: { ...snapshot.menu, dishes: [null] } }]) assert.equal(parsePublishedRestaurant(value), null);
  snapshot.menu.dishes.push(snapshot.menu.dishes[0]); assert.equal(parsePublishedRestaurant(snapshot), null);
});
