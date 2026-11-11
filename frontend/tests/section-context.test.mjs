import test from 'node:test';
import assert from 'node:assert/strict';
import { sectionContext } from '../src/toolkit/sectionContext.ts';
test('section tools only receive content from the loaded project', () => {
  const a = { headline:'Alfajores', description:'Hechos a mano', blocks:[{id:'offer-a', title:'Nuestros sabores',body:'Cacao y vainilla'}] };
  assert.equal(sectionContext(a, 'hero').body, 'Hechos a mano');
  assert.equal(sectionContext(a, 'offer-a').title, 'Nuestros sabores');
  assert.equal(sectionContext({ blocks:[] }, 'offer-a'), null);
  assert.equal(sectionContext(a, null), null);
  assert.equal(sectionContext(null, 'hero'), null);
});
