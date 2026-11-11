import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const code=readFileSync(new URL('./personalization-model.js',import.meta.url),'utf8');
const context=vm.createContext({});
const model=vm.runInContext(code+'\nForUReviewModel;',context);
const plain=x=>JSON.parse(JSON.stringify(x));
test('no materials, no face and short time yield a manageable typographic route without dates',()=>{
  const plan=model.derive('restaurant',{projectName:'Nombre QA',resources:['Ninguno todavía'],comfort:['Escribiendo'],avoid:['Mostrar mi cara'],time:'Sesiones breves',goal:'Presentar mi negocio'});
  assert.equal(plan.noPhoto,true);assert.equal(plan.showFace,false);assert.equal(plan.style,'Composición tipográfica');assert.equal(plan.next,'page');assert.equal(plan.tasks.length,2);assert.ok(plan.tasks.every(t=>t.date===''&&t.status==='todo'&&t.acceptance==='suggested'&&t.reason));
});
test('voice and avoided editing prioritize a script path without forcing camera',()=>{
  const plan=model.derive('services',{comfort:['Usando mi voz'],avoid:['Editar videos'],goal:'Crear contenido'});
  assert.equal(plan.next,'studio');assert.equal(plan.voice,true);assert.equal(plan.showFace,false);assert.equal(plan.format,'story');assert.equal(plan.tasks[0].id,'route-content');
});
test('business in operation has relevant first action and only selected optional areas',()=>{
  const plan=model.derive('restaurant',{stage:'Ya tengo un negocio',goal:'Ordenar mi operación',resources:['Fotos'],otherAreas:['Finanzas','Logística'],cost:'Parcialmente',delivery:['Recojo']});
  assert.equal(plan.stage,'Operar');assert.equal(plan.next,'operation');assert.equal(plan.noPhoto,false);assert.equal(plan.tasks[0].id,'route-operation');assert.ok(plan.tasks.some(t=>t.area==='finance'));assert.ok(plan.tasks.some(t=>t.area==='logistics'));assert.equal(plan.tasks.filter(t=>t.area==='operations').length,1);
});
test('task proposals are idempotent and preserve chosen state, date, manual work and removed suggestions',()=>{
  const proposals=model.derive('restaurant',{}).tasks;
  const old=[{...proposals[0],status:'doing',date:'2026-10-22',acceptance:'accepted'}, {...proposals[1],removed:true}, {id:'manual',area:'finance',title:'Trabajo propio',status:'done'}];
  const once=model.mergeTasks(old,proposals),twice=model.mergeTasks(once,proposals);
  assert.deepEqual(plain(twice),plain(once));assert.equal(once.find(x=>x.id===proposals[0].id).status,'doing');assert.equal(once.find(x=>x.id===proposals[0].id).date,'2026-10-22');assert.ok(!once.filter(x=>!x.removed).some(x=>x.id===proposals[1].id));assert.equal(once.find(x=>x.id==='manual').status,'done');
});
test('six routes provide their own choices and never derive restaurant tools for courses or services',()=>{
  assert.equal(Object.keys(model.routeOptions).length,6);
  for(const route of Object.keys(model.routeOptions)){
    const plan=model.derive(route,{goal:'Ordenar mi operación',sections:[model.routeOptions[route].sections[0]],otherAreas:['Operaciones']});
    assert.equal(plan.sections[0],model.routeOptions[route].sections[0]);assert.ok(plan.tasks[0].reason);
  }
  assert.equal(model.derive('courses',{goal:'Ordenar mi operación'}).tasks[0].title,'Ordenar mi primer módulo');
  assert.equal(model.derive('services',{goal:'Ordenar mi operación'}).tasks[0].title,'Ordenar mis solicitudes');
});
test('final review fragment stays independent and uses the tested model without calls to services',()=>{
  const fragment=readFileSync(new URL('./foru-personalized.html',import.meta.url),'utf8');
  assert.ok(Buffer.byteLength(fragment)<1_000_000);assert.ok(fragment.includes(code));assert.doesNotMatch(fragment,/\bfetch\s*\(|XMLHttpRequest|new WebSocket/);assert.doesNotMatch(fragment,/<!doctype|<html[ >]|<body[ >]/i);assert.match(fragment,/no cambia tu aplicación ni publica contenido/);
});
