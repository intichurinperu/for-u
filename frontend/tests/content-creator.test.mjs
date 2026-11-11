import test from 'node:test';
import assert from 'node:assert/strict';
import { templatesByType } from '../src/data/templates/index.ts';
import { blankContent, contentFromTemplate, saveContentDraft } from '../src/components/shared/contentModel.ts';
test('each industry has all six requested categories with unique template identifiers',()=>{
 const ids=new Set();
 for(const [type,templates] of Object.entries(templatesByType)){
  assert.deepEqual(new Set(templates.map(template=>template.category)),new Set(['reconocimiento','interaccion','venta','conversion','retargeting','fidelizacion']));
  for(const template of templates){assert.equal(template.type,type);assert.ok(!ids.has(template.id));ids.add(template.id);}
 }
});
test('template personalization belongs to the selected project and rejects another industry',()=>{
 const project={id:'restaurant-project',name:'Mi Restaurante',type:'restaurant'};
 const draft=contentFromTemplate(project,templatesByType.restaurant[0]);
 assert.equal(draft.projectId,project.id);assert.ok(draft.caption.includes(project.name));
 assert.throws(()=>contentFromTemplate(project,templatesByType.courses[0]),/rubro/);
});
test('create from scratch has no previous template, text or image',()=>{
 const draft=blankContent('new-project');
 assert.equal(draft.title,'');assert.equal(draft.caption,'');assert.equal(draft.imagePath,'');assert.equal(draft.templateId,null);
});
test('saving content prevents cross-project writes and updates an existing draft',()=>{
 const draft={...blankContent('a'),title:'Hola'};
 const first=saveContentDraft({version:1,drafts:[]},draft,'a');
 assert.throws(()=>saveContentDraft(first,draft,'b'),/otro proyecto/);
 const second=saveContentDraft(first,{...draft,title:'Editado'},'a');
 assert.equal(second.drafts.length,1);assert.equal(second.drafts[0].title,'Editado');assert.equal(first.drafts[0].title,'Hola');
});
