import {test} from 'node:test';
import assert from 'node:assert/strict';
import {todayRoute} from '../src/toolkit/todayModel.ts';
const project={industryKey:'beauty',nodes:[]};
test('reopening a task overrides an older completed phase or task',()=>{
 const initial=todayRoute(project,{completed:[]});
 const task=initial.task;
 const existing={...project,nodes:[{id:'project-'+initial.current.id,title:'Empatizar',taskStatus:'done'},{id:'task1',title:task.title,taskStatus:'done'}]};
 const reopened=todayRoute(existing,{completed:[],pending:[task.id]});
 assert.equal(reopened.current.index,0);
 assert.equal(reopened.task.id,task.id);
 assert.equal(reopened.steps[0].done,false);
 assert.equal(reopened.steps[0].tasks.filter(task=>task.done).length,2);
});
test('Hoy starts with one concrete industry task and advances only after completed subtasks',()=>{
 const initial=todayRoute(project,{completed:[]});assert.equal(initial.current.title,'Empatizar');assert.match(initial.task.title,/clientas/);assert.equal(initial.percentage,0);
 const next=todayRoute(project,{completed:[initial.task.id]});assert.notEqual(next.task.id,initial.task.id);assert.equal(next.current.index,0);assert.equal(next.percentage,7);
 const phase=todayRoute(project,{completed:initial.current.tasks.map(task=>task.id)});assert.equal(phase.current.title,'Definir');assert.equal(phase.percentage,20);
});
test('Hoy recognizes existing project completions and keeps progress scoped to the template',()=>{
 const initial=todayRoute(project,{completed:[]});
 const existing=todayRoute({...project,nodes:[{id:'task1',title:initial.task.title,taskStatus:'done'}]},{completed:['clothing/dt-0/1']});assert.equal(existing.percentage,7);
 const complete=todayRoute(project,{completed:initial.steps.flatMap(step=>step.tasks.map(task=>task.id))});assert.equal(complete.finished,true);assert.equal(complete.percentage,100);
});
