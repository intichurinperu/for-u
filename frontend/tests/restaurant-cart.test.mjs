import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteRestaurantCart, cartWhatsappUrl } from '../src/modules/restaurant/cart.ts';
import { emptyRestaurant, saveDish } from '../src/modules/restaurant/model.ts';
import { restaurantSnapshot, parsePublishedRestaurant } from '../src/modules/restaurant/publicMenu.ts';
const dish = { id:'alfajor',name:'Alfajor',description:'',category:'Dulces',image:'',price:5,available:true,variants:[{id:'caja',name:'Caja de seis',price:28.10,available:true}],extras:[{id:'regalo',name:'Empaque',price:1.20,available:true}] };
const selection = {id:'line',dishId:'alfajor',variantId:'caja',extraIds:['regalo'],quantity:3,note:'Sin tarjeta'};
test('variant replaces base price and extras apply per unit using integer cents',()=>{
 const quote=quoteRestaurantCart([dish],[selection]);
 assert.equal(quote.totalCents,8790); assert.equal(quote.lines[0].unitCents,2930);
 const text=decodeURIComponent(cartWhatsappUrl('51999888777',quote));
 assert.match(text,/Caja de seis/); assert.match(text,/Empaque/); assert.match(text,/Sin tarjeta/); assert.match(text,/87.90/);
});
test('different presentations of the same dish stay separate; legacy dishes need no options',()=>{
 const plain={...dish,variants:undefined,extras:undefined};
 assert.equal(quoteRestaurantCart([plain],[{...selection,variantId:undefined,extraIds:[]}]).totalCents,1500);
 const second={...selection,id:'other',quantity:1,note:'Con tarjeta'};
 assert.equal(quoteRestaurantCart([dish],[selection,second]).lines.length,2);
});
test('unknown, duplicate, disabled options and invalid quantities cannot become a quote',()=>{
 for(const patch of [{variantId:undefined},{variantId:'invented'},{extraIds:['fake']},{extraIds:['regalo','regalo']},{quantity:0},{quantity:1.5},{quantity:100},{note:'x'.repeat(301)}]) assert.throws(()=>quoteRestaurantCart([dish],[{...selection,...patch}]));
 assert.throws(()=>quoteRestaurantCart([{...dish,available:false}],[selection]));
 assert.throws(()=>quoteRestaurantCart([{...dish,extras:[{...dish.extras[0],available:false}]}],[selection]));
 assert.throws(()=>quoteRestaurantCart([dish],[selection,selection]));
});
test('quotes recalculate from catalog and ignore customer supplied price fields',()=>{
 assert.equal(quoteRestaurantCart([dish],[{...selection,price:0,unitCents:0,totalCents:0}]).totalCents,8790);
 const changed={...dish,variants:[{...dish.variants[0],price:30}]};
 assert.equal(quoteRestaurantCart([changed],[selection]).totalCents,9360);
});
test('options survive saving/publication without leaking arbitrary private fields',()=>{
 let data=emptyRestaurant('Alfajores'); data.settings.whatsapp='51999888777';
 data=saveDish(data,{...dish,extras:[{...dish.extras[0],supplierCost:0.2}]});
 const snapshot=restaurantSnapshot(data);
 assert.equal(snapshot.menu.dishes[0].extras[0].supplierCost,undefined);
 assert.equal(snapshot.menu.dishes[0].variants[0].price,28.1);
 assert.ok(parsePublishedRestaurant(snapshot));
 snapshot.menu.dishes[0].variants[0].price=-1;
 assert.equal(parsePublishedRestaurant(snapshot),null);
});
