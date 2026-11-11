import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyEcommerce, saveProduct, priceCart, createOrder, cancelOrder, fulfillOrder } from '../src/modules/ecommerce/model.ts';
const product={id:'p',name:'Taza',price:0.1,stock:3,category:'Hogar',description:'',image:'',active:true};
const fixture=()=>saveProduct(emptyEcommerce('Tienda'),product);
const customer={customer:'Ana',contact:'ana@example.test',address:''};
test('cart aggregates duplicate lines and uses integer cents',()=>{
 const priced=priceCart(fixture(),[{productId:'p',quantity:1},{productId:'p',quantity:2}]);
 assert.equal(priced.lines.length,1);assert.equal(priced.total,0.3);
 assert.throws(()=>priceCart(fixture(),[{productId:'p',quantity:2},{productId:'p',quantity:2}]),/stock/);
});
test('orders reserve stock exactly once and remain unpaid',()=>{
 const data=createOrder(fixture(),[{productId:'p',quantity:2}],customer,'order');
 assert.equal(data.products[0].stock,1);assert.equal(data.orders[0].status,'pending');
 assert.equal(createOrder(data,[{productId:'p',quantity:2}],customer,'order'),data);
 assert.throws(()=>fulfillOrder(data,'order'),/pago/);
});
test('cancelling a pending order restores stock once',()=>{
 const data=createOrder(fixture(),[{productId:'p',quantity:2}],customer,'order');
 const cancelled=cancelOrder(data,'order');assert.equal(cancelled.products[0].stock,3);
 assert.equal(cancelOrder(cancelled,'order'),cancelled);assert.equal(data.products[0].stock,1);
});
test('inactive products, fractional quantities and invalid pricing cannot checkout',()=>{
 const data=fixture(); data.products[0].active=false;
 assert.throws(()=>priceCart(data,[{productId:'p',quantity:1}]));
 assert.throws(()=>priceCart(fixture(),[{productId:'p',quantity:0.5}]));
 assert.throws(()=>saveProduct(fixture(),{...product,price:NaN}));
});
