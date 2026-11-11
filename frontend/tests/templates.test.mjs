import {test} from 'node:test';
import assert from 'node:assert/strict';
import {businessTemplates} from '../src/data/templates.ts';
test('all ten industries have five specific phases with actionable downloadable resources',()=>{
 assert.equal(businessTemplates.length,10);
 const names=new Set();
 for(const template of businessTemplates){
  assert.equal(template.steps.length,5);assert.ok(template.entry.length>15);
  assert.deepEqual(template.steps.map(s=>s.title),['Empatizar','Definir','Idear','Prototipar','Probar']);
  for(const step of template.steps){assert.equal(step.tasks.length,3);assert.ok(step.tools.length>=2);assert.ok(step.tip.length>20);assert.ok(step.example.length>30);assert.ok(step.resource.content.includes(template.entry));assert.ok(step.resource.content.includes('Respuesta / evidencia:'));assert.ok(!names.has(step.resource.name));names.add(step.resource.name);}
 }
 assert.equal(names.size,50);
 assert.equal(new Set(businessTemplates.flatMap(t=>t.steps.flatMap(s=>s.tasks))).size,150);
});
