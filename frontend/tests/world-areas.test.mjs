import test from 'node:test';
import assert from 'node:assert/strict';
import { initialTasks, areaProgress, rewardTask, mascotMessage, isSavedProject, areaToolPath } from '../src/pages/dashboard/areaModel.ts';
test('all five industries start with independent UUID tasks for four areas', () => {
 const ids = new Set();
 for (const type of ['restaurant','ecommerce','hospitality','tourism','courses']) {
  const doc=initialTasks(type); assert.equal(doc.tasks.length,12);
  for(const task of doc.tasks){ assert.ok(isSavedProject(task.id)); assert.ok(!ids.has(task.id)); ids.add(task.id); assert.equal(task.done,false); }
  for(const area of ['marketing','finance','logistics','operations']) assert.equal(areaProgress(doc.tasks,area).total,3);
 }
 assert.equal(isSavedProject('project-'+crypto.randomUUID()),false);
});
test('empty areas are not complete; reopening a task reduces progress',()=>{
 assert.equal(areaProgress([], 'marketing').complete,false);
 const tasks=initialTasks('tourism').tasks.map(t=>({...t,done:true}));
 assert.equal(areaProgress(tasks,'marketing').percent,100);
 tasks[0].done=false; assert.equal(areaProgress(tasks,'marketing').percent,67);
});
test('task rewards are idempotent and never change other areas or tasks',()=>{
 const original={version:1,areas:{}};
 const next=rewardTask(original,'marketing');
 assert.deepEqual(original.areas,{});
 assert.deepEqual(rewardTask(next,'marketing'),next);
 assert.equal(next.areas.finance,undefined);
 assert.equal(next.areas.marketing.searchReward,false);
});
test('guide chooses a real pending task and routes retain project identity',()=>{
 const doc=initialTasks('restaurant');
 const result=mascotMessage('finance','restaurant',doc.tasks);
 assert.equal(result.taskId,doc.tasks[3].id);
 assert.ok(result.message.includes(doc.tasks[3].title));
 const id=crypto.randomUUID(); assert.equal(areaToolPath('editor','restaurant',id),`/modules/restaurant/editor?project=${id}`);
});

test('malformed cloud documents fail without silently resetting user progress', async()=>{
 const {parseAreaTasks,parseWorldState}=await import('../src/pages/dashboard/areaModel.ts');
 const doc=initialTasks('restaurant'); assert.deepEqual(parseAreaTasks(doc),doc);
 assert.throws(()=>parseAreaTasks({...doc,tasks:[doc.tasks[0],doc.tasks[0]]}));
 assert.throws(()=>parseAreaTasks({version:1,tasks:[null]}));
 assert.throws(()=>parseWorldState({version:1,areas:{finance:{decoration:2,taskReward:false,searchReward:false}}}));
 assert.deepEqual(parseWorldState({version:1,areas:{}}),{version:1,areas:{}});
});
