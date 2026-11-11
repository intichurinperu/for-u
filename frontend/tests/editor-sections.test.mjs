import test from 'node:test';
import assert from 'node:assert/strict';
import { createEditorSection, sectionPresets, editorIndustry, reorderEditorSections } from '../src/toolkit/editorSections.ts';
test('all five industries provide relevant blocks without replacing saved content', () => {
 const industries=['restaurant','ecommerce','hospitality','tourism','courses'];
 assert.equal(new Set(industries.map(type=>sectionPresets(type)[0].key)).size,5);
 for(const type of industries){ const preset=sectionPresets(type)[0]; const block=createEditorSection(type,preset.key); assert.equal(block.title,preset.title); assert.ok(block.id); assert.equal(createEditorSection(type,'unknown'),null); }
 assert.equal(editorIndustry('gastronomy').name,'Restaurante');
});
test('reordering uses stable IDs and preserves data without mutating the draft', () => {
 const original=[{id:'a',title:'A',body:'one'},{id:'b',title:'B',body:'two'},{id:'c',title:'C',body:'three'}];
 assert.deepEqual(reorderEditorSections(original,'a','c').map(x=>x.id),['b','c','a']);
 assert.deepEqual(original.map(x=>x.id),['a','b','c']);
 assert.equal(reorderEditorSections(original,'missing','b'),original);
 assert.equal(reorderEditorSections(original,'a','a'),original);
});


test('every route can add its own catalog again and specialized sections remain editable without fabricated content',()=>{
 const catalog={restaurant:'menu',ecommerce:'catalog',hospitality:'rooms',tourism:'experiences',courses:'courses',services:'offer'};
 for(const [route,key] of Object.entries(catalog)){
  const block=createEditorSection(route,key);assert.equal(block.kind,'catalog',route);assert.equal(block.body,'');
  assert.equal(new Set(sectionPresets(route).map(row=>row.key)).size,sectionPresets(route).length);
 }
 assert.equal(createEditorSection('hospitality','amenities').kind,'details');
 assert.equal(createEditorSection('hospitality','arrival').kind,'location');
 assert.equal(createEditorSection('courses','teacher').kind,'story');
 assert.equal(createEditorSection('courses','materials').body,'');
 assert.equal(createEditorSection('services','process').body,'');
});


test('adding a designed section upgrades only the edited draft and undo can recover its prior presentation',async()=>{
 const {addDesignedSection}=await import('../src/toolkit/editorSections.ts');
 const {prepareRoutePage}=await import('../src/experience/routePreparation.ts');
 const {emptyProposal}=await import('../src/proposal/model.ts');
 const saved={...prepareRoutePage('QA','services',{},emptyProposal()),presentationVersion:3};
 const before=JSON.stringify(saved),block=createEditorSection('services','process');
 const next=addDesignedSection(saved,block,saved.blocks[1].id);
 assert.equal(next.presentationVersion,4);assert.equal(next.blocks[1].id,block.id);
 assert.equal(JSON.stringify(saved),before);assert.equal(saved.presentationVersion,3);
 const full={...saved,blocks:Array.from({length:8},(_,i)=>({id:'old-'+i,title:'Conservar',body:'Texto confirmado'}))};
 assert.equal(addDesignedSection(full,block,null),full);
 assert.equal(addDesignedSection(saved,block,'missing-target'),saved);
});


test('adding the first catalog links the project source while existing manual offers are preserved',async()=>{
 const {addDesignedSection}=await import('../src/toolkit/editorSections.ts');
 const {prepareRoutePage}=await import('../src/experience/routePreparation.ts');
 const {emptyProposal}=await import('../src/proposal/model.ts');
 const original={...prepareRoutePage('QA','services',{},emptyProposal()),catalogSource:undefined,blocks:[]};
 assert.equal(addDesignedSection(original,createEditorSection('services','offer'),null,'services').catalogSource,'proposal');
 assert.equal(addDesignedSection(original,createEditorSection('tourism','experiences'),null,'tourism').catalogSource,'module');
 const manual={...original,offers:[{id:'manual',name:'Conservar mi oferta',pricing:'quote',price:null,description:'Mi texto',conditions:'',image:''}]};
 const next=addDesignedSection(manual,createEditorSection('services','offer'),null,'services');
 assert.equal(next.catalogSource,undefined);assert.equal(next.offers,manual.offers);
});
