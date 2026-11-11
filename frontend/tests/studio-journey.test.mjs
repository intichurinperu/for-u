import test from 'node:test';
import assert from 'node:assert/strict';
import { studioJourney, validStudioDraft } from '../src/pages/dashboard/studioJourney.ts';
test('a missing or malformed draft never unlocks management', () => {
  for (const value of [null, {}, { headline:'', slug:'abc', blocks:[] }, { headline:'Hola', slug:'bad slug', blocks:[] }]) assert.equal(validStudioDraft(value), false);
});
test('all five industries retain their own offer language', () => {
  const labels = ['restaurant','ecommerce','hospitality','tourism','courses'].map(type => studioJourney(type, null, false)[1].title);
  assert.equal(new Set(labels).size, 5);
  assert.ok(studioJourney('restaurant', null, false).every(step => !step.ready && !step.started));
});
test('publication comes from public-site state, not a stale draft flag', () => {
  const draft = { name:'Alfajores', headline:'Hechos con cariño', slug:'alfajores', description:'Para compartir', heroImage:'https://example.com/cover.jpg', blocks:[{id:'offer',title:'Oferta',body:'Alfajores artesanales'}],published:true };
  assert.equal(validStudioDraft(draft), true);
  assert.equal(studioJourney('restaurant', draft, false)[3].ready, false);
  assert.equal(studioJourney('restaurant', draft, true)[3].ready, true);
});

test('placeholder sections do not claim that the offer is ready', () => {
 const draft = {headline:'Tu negocio',slug:'negocio',blocks:[{id:'about',title:'Historia',body:'Cuenta tu historia'}]};
 assert.equal(studioJourney('restaurant',draft,false)[1].ready,false);
 assert.equal(studioJourney('restaurant',draft,false,{dishes:[{id:'a',name:'Alfajor',price:5,available:true}]} )[1].ready,true);
});
test('catalog mapping preserves each industry and excludes unavailable or invalid offers', async () => {
 const {studioCatalog} = await import('../src/pages/dashboard/studioJourney.ts');
 for (const [type,key] of Object.entries({restaurant:'dishes',ecommerce:'products',hospitality:'rooms',tourism:'tours',courses:'courses'})) {
  const item={id:'real',name:'Oferta',price:0};
  assert.deepEqual(studioCatalog(type,{[key]:[item,{...item,id:'bad',price:-1},{...item,id:'hidden',available:false}]}),[item]);
 }
});
