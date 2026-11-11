import test from 'node:test';import assert from 'node:assert/strict';
import {readSavedCart,submitSavedOrder} from '../src/modules/restaurant/orderSession.ts';
const selection={id:'l',dishId:'coffee',quantity:1,extraIds:[],note:'Sin azúcar'};
const request={site_slug:'qa-a',selections:[selection],fulfillment:{mode:'pickup'},customer_name:'QA',phone:'51999999999',request_id:crypto.randomUUID(),tracking_token:'a'.repeat(64),expected_total:600};
function storage(){const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};}
test('network/unknown result preserves exact request and secret across reload; retry uses same key',async()=>{const s=storage(),calls=[];await assert.rejects(submitSavedOrder(s,request,async r=>{calls.push(structuredClone(r));throw new Error('Lost response');}));const recovered=JSON.parse(s.getItem('foru-order-attempt:qa-a'));assert.deepEqual(recovered,request);const receipt=await submitSavedOrder(s,recovered,async r=>{calls.push(r);return {id:'same-order'};});assert.deepEqual(calls[0],calls[1]);assert.equal(receipt.id,'same-order');assert.equal(s.getItem('foru-order-attempt:qa-a'),null);assert.equal(JSON.parse(s.getItem('foru-order-receipt:qa-a')).token,request.tracking_token);});
test('receipt storage failure retains attempt, while another business keeps independent cart/receipt',async()=>{const s=storage();s.setItem('foru-order-attempt:qa-b','unrelated');const write=s.setItem;s.setItem=(k,v)=>{if(k.includes('receipt'))throw new Error('Quota');write(k,v);};await assert.rejects(submitSavedOrder(s,request,async()=>({id:'saved-on-server'})));assert.ok(s.getItem('foru-order-attempt:qa-a'));assert.equal(s.getItem('foru-order-attempt:qa-b'),'unrelated');});
test('cart reload preserves selections but rejects corrupted shape and drops customer-supplied prices',()=>{assert.deepEqual(readSavedCart(JSON.stringify([{...selection,price:0,totalCents:0}])),[{...selection,variantId:undefined}]);for(const value of ['{}','[null]',JSON.stringify([{...selection,quantity:0}]),JSON.stringify([{...selection,extraIds:[null]}])])assert.throws(()=>readSavedCart(value));});

import {areaToolPath} from '../src/pages/dashboard/areaModel.ts';
import {parseWorkspaceFocus} from '../src/pages/dashboard/workspaceFocusModel.ts';
test('order tool keeps project context in persisted continuation without opening another module',()=>{
 const project='11111111-1111-4111-8111-111111111111';
 assert.equal(areaToolPath('orders','restaurant',project),`/modules/restaurant/orders?project=${project}`);
 assert.equal(areaToolPath('orders','hospitality',project),`/dashboard?project=${project}`);
 assert.equal(parseWorkspaceFocus({version:2,today:[],destinations:{[project]:{projectId:project,tool:'orders'}}}).destinations[project].tool,'orders');
});
