import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyRestaurant, saveDish, saveIngredient, prepareRecipe, preparationImpact, moveSection, whatsappOrderUrl } from '../src/modules/restaurant/model.ts';

function fixture() {
  return { ...emptyRestaurant('Mi restaurante'), inventory: [{id:'flour', name:'Harina', stock:1, minimum:0.2, unit:'kg'}], recipes:[{id:'bread',name:'Pan', portions:4,ingredients:[{ingredientId:'flour',quantity:0.3}]}] };
}
test('editing a dish updates it instead of creating a duplicate; free dishes are valid', () => {
  const dish = {id:'a',name:'Agua',price:2,description:'',image:'',category:'Bebidas',available:true};
  const data = saveDish(saveDish(emptyRestaurant('Local'), dish), {...dish,price:0});
  assert.equal(data.dishes.length,1); assert.equal(data.dishes[0].price,0);
  assert.throws(() => saveDish(data,{...dish,price:-1}));
});
test('insufficient stock never changes inventory or history', () => {
  const data = fixture(); const before = structuredClone(data);
  assert.throws(() => prepareRecipe(data,'bread',4,'operation'), /suficiente/);
  assert.deepEqual(data,before);
});
test('confirmation deducts stock once and records the preparation', () => {
  const data = fixture(); const result = prepareRecipe(data,'bread',2,'operation');
  assert.equal(result.inventory[0].stock,0.4); assert.equal(data.inventory[0].stock,1);
  assert.equal(result.preparations.length,1);
  assert.equal(prepareRecipe(result,'bread',2,'operation'),result);
});
test('repeated ingredients are aggregated and cannot overdraw stock', () => {
  const data = fixture(); data.recipes[0].ingredients.push({ingredientId:'flour',quantity:0.3});
  assert.equal(preparationImpact(data,data.recipes[0],2)[0].required,1.2);
  assert.throws(() => prepareRecipe(data,'bread',2,'operation'), /suficiente/);
});
test('invalid recipes, missing ingredients and invalid quantities cannot be prepared', () => {
  for (const quantity of [0,-1,NaN,Infinity]) {
    const data=fixture(); data.recipes[0].ingredients[0].quantity=quantity;
    assert.throws(() => prepareRecipe(data,'bread',1,'op'));
  }
  const data=fixture(); data.inventory=[];
  assert.throws(() => prepareRecipe(data,'bread',1,'op'));
  for (const batches of [0,-1,0.5,NaN,Infinity]) assert.throws(() => prepareRecipe(fixture(),'bread',batches,'op'));
});
test('ingredient units cannot change underneath existing recipes', () => {
  const data=fixture(); assert.throws(() => saveIngredient(data,{...data.inventory[0],unit:'g'}),/unidad/);
});
test('section order is preserved at boundaries and changed without mutating source', () => {
  const data=fixture(); assert.equal(moveSection(data,'hero',-1),data);
  assert.equal(moveSection(data,'hero',1).sections[0].id,'menu');
  assert.equal(data.sections[0].id,'hero');
});
test('WhatsApp orders use encoded text and reject unavailable dishes', () => {
  const dish={id:'a',name:'Café & pan',price:5,description:'',image:'',category:'',available:true};
  const url=new URL(whatsappOrderUrl('+51 999 888 777',[{dish,quantity:2}]));
  assert.equal(url.hostname,'wa.me'); assert.match(url.searchParams.get('text'),/Total: S\/ 10.00/);
  assert.throws(() => whatsappOrderUrl('',[{dish,quantity:1}]));
  assert.throws(() => whatsappOrderUrl('51999888777',[{dish:{...dish,available:false},quantity:1}]));
});

test('restaurant document keeps the saved catalog and rejects malformed cloud data', async () => {
  const { parseRestaurantDocument } = await import('../src/modules/restaurant/restaurantDocument.ts');
  const saved = saveDish(emptyRestaurant('Alfajores'), {id:'alfajor',name:'Cacao',price:6,description:'',image:'',category:'Alfajores',available:true});
  assert.equal(parseRestaurantDocument(saved), saved);
  assert.equal(parseRestaurantDocument(saved).dishes[0].price, 6);
  for (const invalid of [{}, {...saved,dishes:[null]}, {...saved,inventory:[{id:'a',stock:-1}]}, {...saved,recipes:[null]}]) assert.throws(()=>parseRestaurantDocument(invalid), /no se han sobrescrito/);
});
