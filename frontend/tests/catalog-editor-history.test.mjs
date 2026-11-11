import test from 'node:test';
import assert from 'node:assert/strict';
import {editorHistory} from '../src/toolkit/editorHistory.ts';
test('external catalog sync preserves page undo/redo without reverting confirmed catalog prices',()=>{
 const base={headline:'Before',offers:[{id:'restaurant:original',price:6}]};
 let state=editorHistory({past:[],present:base,future:[]},{type:'edit',value:{...base,headline:'After'}});
 state=editorHistory(state,{type:'undo'});
 const previous=JSON.stringify(state);
 const synced=editorHistory(state,{type:'sync',value:draft=>({...draft,offers:draft.offers.map(offer=>({...offer,price:6.5}))})});
 assert.equal(synced.present.offers[0].price,6.5);assert.equal(synced.future[0].offers[0].price,6.5);assert.equal(JSON.stringify(state),previous);
 const redone=editorHistory(synced,{type:'redo'});assert.equal(redone.present.headline,'After');assert.equal(redone.present.offers[0].price,6.5);
 const undone=editorHistory(redone,{type:'undo'});assert.equal(undone.present.headline,'Before');assert.equal(undone.present.offers[0].price,6.5);assert.equal(undone.present.offers[0].id,'restaurant:original');
});
