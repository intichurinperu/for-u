import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyProposal, blankOffer, parseProposal, validateOffer, proposalOffers, nativeOffers, prepareLanding, publicOffer } from '../src/proposal/model.ts';
import { createNativeProduct, updateNativePrice } from '../src/proposal/catalogEditing.ts';
import { emptyRestaurant } from '../src/modules/restaurant/model.ts';
import { parseSiteData } from '../src/toolkit/publicData.ts';

const fixture = () => ({ ...blankOffer(), name:'Oferta QA', pricing:'fixed', price:12.5 });
const page = () => ({ name:'QA',slug:'qa-proposal-test',headline:'Texto manual',description:'Mi historia',cta:'Consultar',whatsapp:'',calendly:'',template:'services',color:'#123456',fields:[],blocks:[{id:'manual',title:'Manual',body:'Conservar'}],heroImage:'https://example.com/cover.jpg' });
test('blank prices are not free; quotation and explicitly free offers have distinct semantics', () => {
  const offer = { ...fixture(), price:null };
  validateOffer(offer); // incomplete draft may be saved
  assert.throws(() => validateOffer(offer,true));
  assert.throws(() => validateOffer({ ...offer,price:0 },true));
  validateOffer({ ...offer,pricing:'free',price:0 },true);
  validateOffer({ ...offer,pricing:'quote',price:null },true);
  assert.throws(() => validateOffer({ ...offer,pricing:'quote',price:99 },true));
});
test('a restaurant product is created once in its native catalog; proposal keeps only a reference', () => {
  const offer = { ...fixture(),kind:'product',description:'Café QA',conditions:'Recoger en local',image:'https://example.com/coffee.jpg',variants:[{id:'large',name:'Grande QA',price:15,available:true}],extras:[{id:'extra',name:'Extra QA',price:2,available:true}] };
  const catalog = createNativeProduct('restaurant',undefined,offer,'QA Studio4U');
  assert.equal(catalog.dishes.length,1);
  const proposal = { ...emptyProposal(), nativeIds:['restaurant:' + offer.id] };
  const resolved = proposalOffers(proposal,'restaurant',catalog);
  assert.equal(proposal.offers.length,0);
  assert.equal(resolved[0].description,offer.description);
  assert.equal(resolved[0].conditions,offer.conditions);
  assert.deepEqual(resolved[0].variants,offer.variants);
  assert.deepEqual(resolved[0].extras,offer.extras);
  const changed = updateNativePrice('restaurant',catalog,resolved[0].id,18);
  assert.equal(proposalOffers(proposal,'restaurant',changed)[0].price,18);
  assert.equal(catalog.dishes[0].price,12.5);
  assert.deepEqual(changed.dishes[0].variants,catalog.dishes[0].variants);
  assert.throws(() => updateNativePrice('restaurant',catalog,'ecommerce:other',1));
});
test('mixed offerings work without changing rubric and public fields exclude operational data', () => {
  const product = { ...fixture(),kind:'product' };
  const catalog = createNativeProduct('restaurant',undefined,product,'QA');
  const service = { ...blankOffer(),name:'Asesoría QA',kind:'service',conditions:'15 minutos',pricing:'quote',price:null };
  const proposal = { ...emptyProposal(),nativeIds:['restaurant:' + product.id],offers:[service,{ ...fixture(),kind:'package' }] };
  const resolved = proposalOffers(proposal,'restaurant',{ ...catalog,inventory:[{ secret:'costs' }],dishes:catalog.dishes.map(d => ({ ...d,cost:8,customer:'private' })) });
  assert.deepEqual(resolved.map(o=>o.kind),['product','service','package']);
  assert.equal(JSON.stringify(resolved).includes('private'),false);
  assert.equal(JSON.stringify(resolved).includes('cost'),false);
  assert.equal(createNativeProduct('restaurant',catalog,service,'QA'),null);
  assert.throws(() => proposalOffers({ ...proposal,nativeIds:['restaurant:deleted'] },'restaurant',catalog));
});
test('all rubrics preserve descriptions and photos while resolving their existing identifiers', () => {
  for(const [type,collection] of Object.entries({restaurant:'dishes',ecommerce:'products',hospitality:'rooms',tourism:'tours',courses:'courses'})) {
    const native = nativeOffers(type,{version:1,[collection]:[{id:'existing',name:'QA',price:7,image:'https://example.com/photo.jpg',description:'Información real',available:true}]});
    assert.equal(native[0].id,type + ':existing');
    assert.equal(native[0].image,'https://example.com/photo.jpg');
    assert.equal(native[0].description,'Información real');
  }
});
test('selective preparation preserves manual edits, URL and images; it never mutates publication or source', () => {
  const base=page(), published=structuredClone(base);
  const proposal={...emptyProposal(),offering:'Café y alfajores',message:'Mensaje confirmado',value:'Valor confirmado',conditions:'Condiciones confirmadas',cta:'Contactar',offers:[fixture()]};
  const source={proposalRevision:'r1',catalogRevision:null};
  const next=prepareLanding(base,proposal,proposal.offers,source,['headline','offers']);
  assert.equal(next.headline,proposal.message);
  assert.equal(next.description,base.description);
  assert.equal(next.slug,base.slug);
  assert.equal(next.heroImage,base.heroImage);
  assert.deepEqual(next.blocks,base.blocks);
  assert.deepEqual(base,published);
  assert.equal(next.catalogSource,'proposal');
  assert.equal(next.menuItems,undefined);
  assert.deepEqual(next.proposalSource,source);
});
test('unknown formats and duplicate references fail without replacing stored data', () => {
  const saved={...emptyProposal(),offers:[fixture()]};
  const before=structuredClone(saved);
  assert.equal(parseProposal(saved),saved);
  assert.throws(() => parseProposal({...saved,version:2}));
  assert.throws(() => parseProposal({...saved,nativeIds:['same','same']}));
  assert.throws(() => parseProposal({...saved,offers:[saved.offers[0],saved.offers[0]]}));
  assert.deepEqual(saved,before);
});
test('public parser preserves rich offers and legacy pages, excludes private fields and rejects invalid prices', () => {
  const offer={...fixture(),cost:9,customer:'secret',image:'https://example.com/qa.jpg',variants:[{id:'v',name:'Caja',price:20,available:true}],extras:[{id:'x',name:'Extra',price:1,available:true}]};
  const parsed=parseSiteData({...page(),offers:[offer]});
  assert.deepEqual(parsed.offers,[publicOffer(offer)]);
  assert.equal(JSON.stringify(parsed).includes('secret'),false);
  assert.equal(parseSiteData({...page(),offers:[{...offer,price:null}]}),null);
  assert.equal(parseSiteData({...page(),offers:[offer,offer]}),null);
  assert.equal(parseSiteData({...page(),offers:[{...offer,image:'javascript:alert(1)'}]}).offers[0].image,'');
  assert.equal(parseSiteData({...page(),menuItems:[{id:'old',name:'Anterior',price:8}]}).menuItems[0].price,8);
});

test('saved JSONB key order does not trigger a repeated publication review', async () => {
  const { sameOffers } = await import('../src/proposal/model.ts');
  const source=[{...fixture(),variants:[{id:'v',name:'Caja QA',price:20,available:true}]}];
  function jsonb(value) { return Array.isArray(value) ? value.map(jsonb) : value && typeof value==='object' ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,jsonb(value[key])])) : value; }
  assert.equal(sameOffers(source,jsonb(source)),true);
  assert.equal(sameOffers(source,[{...source[0],price:19}]),false);
});
