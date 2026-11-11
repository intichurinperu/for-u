import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyRestaurant} from '../src/modules/restaurant/model.ts';
import {emptyProposal,proposalOffers} from '../src/proposal/model.ts';
import {prepareRestaurantOfferSave} from '../src/toolkit/restaurantOfferSource.ts';
const dish={id:'dish-new',name:'QA product',description:'Confirmed',category:'Products',price:3.5,image:'',available:true,variants:[{id:'variant-kept',name:'Box',price:6,available:true}],extras:[{id:'extra-kept',name:'Extra',price:1,available:true}]};
test('new menu item joins a mixed page by reference without price copies or losing service/private data',()=>{
 const menu=emptyRestaurant('QA');menu.inventory=[{id:'private-ingredient',name:'Private',unit:'g',stock:50,minimum:2}];
 const service={id:'service-kept',kind:'service',name:'My service',description:'',image:'',pricing:'quote',price:null,conditions:''};
 const proposal={...emptyProposal(),message:'Keep this message',offers:[service]};const before=JSON.stringify({menu,proposal});
 const result=prepareRestaurantOfferSave(menu,dish,proposal,true);assert.deepEqual(result.proposal.nativeIds,['restaurant:dish-new']);assert.deepEqual(result.proposal.offers,[service]);assert.equal(result.proposal.message,proposal.message);assert.deepEqual(result.menu.inventory,menu.inventory);assert.equal(JSON.stringify({menu,proposal}),before);
 const retry=prepareRestaurantOfferSave(result.menu,{...dish,price:4},result.proposal,true);assert.equal(retry.menu.dishes.length,1);assert.equal(retry.proposal.nativeIds.length,1);const offers=proposalOffers(retry.proposal,'restaurant',retry.menu);assert.equal(offers[0].price,4);assert.equal(offers[0].variants[0].id,'variant-kept');assert.equal(offers[0].extras[0].id,'extra-kept');assert.equal(offers[1].id,'service-kept');assert.equal(offers.some(o=>'inventory'in o),false);
 assert.throws(()=>prepareRestaurantOfferSave(menu,{...dish,price:NaN},proposal,true));assert.throws(()=>prepareRestaurantOfferSave(menu,dish,undefined,true));assert.equal(menu.dishes.length,0);
});
