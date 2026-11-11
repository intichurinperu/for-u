import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogSnapshot} from '../src/toolkit/catalogSnapshot.ts';
test('public catalog snapshots exclude customer and operational fields for all industries',()=>{
 for (const [type,key] of Object.entries({restaurant:'dishes',ecommerce:'products',hospitality:'rooms',tourism:'tours',courses:'courses'})) {
  const item={id:'a',name:' Oferta ',price:7.50,stock:99,cost:2,customer:'private'};
  const doc={version:1,[key]:[item],bookings:[{contact:'private'}]};
  assert.deepEqual(catalogSnapshot(type,doc),[{id:'a',name:'Oferta',price:7.5}]);
  assert.equal(doc[key][0].name,' Oferta ');
 }
});
test('unavailable entries are removed but malformed or oversized catalogs never silently replace a page',()=>{
 const item={id:'a',name:'Cacao',price:7};
 assert.deepEqual(catalogSnapshot('restaurant',{version:1,dishes:[{...item,available:false}]}),[]);
 for(const payload of [null,{}, {version:1,dishes:[{...item,price:-1}]},{version:1,dishes:[item,item]},{version:1,dishes:Array.from({length:31},(_,i)=>({...item,id:String(i)}))}]) assert.throws(()=>catalogSnapshot('restaurant',payload));
});
