import test from 'node:test';
import assert from 'node:assert/strict';
import {readIdeaDraft,writeIdeaDraft} from '../src/studio/ideaDrafts.ts';
const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('switching themes preserves distinct drafts and starts from saved theme notes',()=>{
 const store=storage();assert.equal(readIdeaDraft(store,'u','p','Proceso','Mis notas'),'Mis notas');
 writeIdeaDraft(store,'u','p','Proceso','Mi guion en progreso');
 assert.equal(readIdeaDraft(store,'u','p','Consejos','Otros apuntes'),'Otros apuntes');
 writeIdeaDraft(store,'u','p','Consejos','Un consejo');
 assert.equal(readIdeaDraft(store,'u','p','Proceso','Notas cambiadas'),'Mi guion en progreso');
 assert.equal(readIdeaDraft(store,'u','p','Consejos'),'Un consejo');
 assert.equal(readIdeaDraft(store,'u','otro','Proceso','Nuevo proyecto'),'Nuevo proyecto');
 assert.equal(readIdeaDraft(store,'otra','p','Proceso','Otra cuenta'),'Otra cuenta');
});
test('a cleared draft remains empty and legacy free ideas do not leak into theme drafts',()=>{
 const store=storage();store.setItem('foru:studio-idea:u:p','Mi idea anterior');
 assert.equal(readIdeaDraft(store,'u','p',''),'Mi idea anterior');
 assert.equal(readIdeaDraft(store,'u','p','Proceso','Notas'),'Notas');
 writeIdeaDraft(store,'u','p','Proceso','');assert.equal(readIdeaDraft(store,'u','p','Proceso','Notas'),'');
});
test('unavailable storage does not prevent writing or recovering the theme notes',()=>{
 const store={getItem(){throw Error('disabled');},setItem(){throw Error('full');}};
 assert.equal(readIdeaDraft(store,'u','p','Proceso','Notas privadas'),'Notas privadas');
 assert.doesNotThrow(()=>writeIdeaDraft(store,'u','p','Proceso','Texto'));
});
