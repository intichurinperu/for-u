import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyProposal} from '../src/proposal/model.ts';
import {prepareProposalOfferSave} from '../src/toolkit/proposalOfferSource.ts';
const offer={id:'service-qa',kind:'service',name:'Confirmed service',description:'Owner text',image:'',pricing:'quote',price:null,conditions:'Confirmed conditions'};
test('inline proposal edit preserves native references, other offers and original data without mutating',()=>{
 const other={...offer,id:'package-qa',kind:'package'};const doc={...emptyProposal(),nativeIds:['restaurant:dish-qa'],offers:[offer,other],message:'Keep message',privateMetadata:{keep:true}};const before=JSON.stringify(doc);
 const next=prepareProposalOfferSave(doc,{...offer,pricing:'fixed',price:120},false);
 assert.equal(next.offers[0].price,120);assert.deepEqual(next.nativeIds,doc.nativeIds);assert.deepEqual(next.offers[1],other);assert.equal(next.message,doc.message);assert.deepEqual(next.privateMetadata,doc.privateMetadata);assert.equal(JSON.stringify(doc),before);
});
test('new proposal offer retries with its original ID and rejects deleted or invalid offers',()=>{
 const next=prepareProposalOfferSave(undefined,offer,true);const retry=prepareProposalOfferSave(next,{...offer,description:'Updated'},true);assert.equal(retry.offers.length,1);assert.equal(retry.offers[0].description,'Updated');
 assert.throws(()=>prepareProposalOfferSave(emptyProposal(),offer,false));assert.throws(()=>prepareProposalOfferSave(next,{...offer,pricing:'fixed',price:null},false));assert.throws(()=>prepareProposalOfferSave({...next,nativeIds:[offer.id]},offer,false));
 const full={...emptyProposal(),offers:Array.from({length:30},(_,i)=>({...offer,id:'offer-'+i}))};assert.throws(()=>prepareProposalOfferSave(full,offer,true));assert.equal(full.offers.length,30);assert.throws(()=>prepareProposalOfferSave({...emptyProposal(),nativeIds:Array.from({length:30},(_,i)=>'restaurant:'+i)},offer,true));
});
