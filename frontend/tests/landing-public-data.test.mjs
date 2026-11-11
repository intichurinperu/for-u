import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSiteData } from '../src/toolkit/publicData.ts';
const base = { name: 'Alfajores', headline: 'Hechos para compartir', blocks: [] };
test('public landing preserves valid menu prices and excludes malformed products', () => {
  const result = parseSiteData({ ...base, menuItems: [{ id: 'one', name: 'Alfajor del Valle', price: 5 }, { id: 'negative', name: 'Invalid', price: -1 }, { id: 'infinite', name: 'Invalid', price: Infinity }, { id: 'text', name: 'Invalid', price: '5' }] });
  assert.deepEqual(result.menuItems, [{ id: 'one', name: 'Alfajor del Valle', price: 5 }]);
});
test('public gallery rejects unsafe sources and bounds new content', () => {
  const result = parseSiteData({ ...base, gallery: [{ role: 'Logo', url: 'javascript:alert(1)', alt: 'x' }, { role: 'Productos', url: 'https://example.com/photo.jpg', alt: 'Alfajor' }], menuItems: Array.from({ length: 40 }, (_, i) => ({ id: String(i), name: 'A', price: 1 })) });
  assert.equal(result.gallery.length, 1);
  assert.equal(result.gallery[0].url, 'https://example.com/photo.jpg');
  assert.equal(result.menuItems.length, 30);
  assert.deepEqual(parseSiteData(base).menuItems, []);
});
