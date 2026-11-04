import test from 'node:test';import assert from 'node:assert/strict';
import {adjustTimeline,splitTimeline,timelineClock,removeTimelineSilences} from '../src/toolkit/videoTimelineModel.ts';
const rows=[{start:0,end:1,text:'Hola'},{start:2,end:4,text:'Mi negocio'}];
test('timeline trims and moves remain in bounds without overlapping neighboring captions',()=>{
 assert.equal(adjustTimeline(rows,0,'end',10,5)[0].end,2);
 assert.equal(adjustTimeline(rows,1,'start',-10,5)[1].start,1);
 const moved=adjustTimeline(rows,1,'move',20,5);assert.deepEqual(moved[1],{start:3,end:5,text:'Mi negocio'});
 assert.equal(adjustTimeline(rows,0,'start',10,5)[0].start,.95);
 assert.deepEqual(rows,[{start:0,end:1,text:'Hola'},{start:2,end:4,text:'Mi negocio'}]);
 assert.equal(adjustTimeline(rows,0,'move',NaN,5),rows);
});
test('splitting preserves original source times and leaves caption synchronization unchanged',()=>{
 const split=splitTimeline([{start:2,end:6}],4);assert.deepEqual(split,[{start:2,end:4},{start:4,end:6}]);
 assert.equal(split.reduce((sum,row)=>sum+row.end-row.start,0),4);
 assert.equal(splitTimeline(rows,1.5),rows);assert.equal(splitTimeline(rows,.02),rows);
});
test('timeline labels show minutes and tenths and handle invalid media duration',()=>{assert.equal(timelineClock(65.3),'1:05.3');assert.equal(timelineClock(NaN),'0:00.0');});

test('automatic silence removal never restores manually removed footage',()=>{
 const current=[{start:1,end:4},{start:6,end:9}];
 const result=removeTimelineSilences(current,[{start:2,end:3},{start:7,end:8}],10);
 assert.equal(result.length,4);
 for(const part of result){assert.ok(current.some(row=>part.start>=row.start&&part.end<=row.end));assert.ok(part.end-part.start>=.05);}
 assert.ok(!result.some(part=>part.start<5&&part.end>5));
 assert.deepEqual(removeTimelineSilences(current,[],10),current);
});

test('reordering and magnetic projection preserve source footage and move captions with their clips',async()=>{
 const {reorderTimeline,montageTimeline,montageCaptions,sourceAtMontage,montageAtSource}=await import('../src/toolkit/videoTimelineModel.ts');
 const source=[{start:1,end:3},{start:6,end:9}],moved=reorderTimeline(source,1,0);
 assert.deepEqual(moved,[source[1],source[0]]);assert.deepEqual(source,[{start:1,end:3},{start:6,end:9}]);
 assert.deepEqual(montageTimeline(moved).map(({start,end})=>({start,end})),[{start:0,end:3},{start:3,end:5}]);
 const captions=montageCaptions(moved,[{start:0,end:2,text:'primero'},{start:7,end:8,text:'segundo'},{start:4,end:5,text:'quitado'}]);
 assert.deepEqual(captions.map(({start,end,text,index})=>({start,end,text,index})),[{start:1,end:2,text:'segundo',index:1},{start:3,end:4,text:'primero',index:0}]);
 assert.equal(sourceAtMontage(moved,3.5),1.5);assert.equal(montageAtSource(moved,1.5),3.5);assert.equal(reorderTimeline(source,-1,2),source);
});
test('clip animations use source boundaries and protect short clips',async()=>{
 const {clipAppearance}=await import('../src/toolkit/videoComposition.ts');
 assert.equal(clipAppearance(2,{start:2,end:3},{enter:'fade',exit:'none'}).opacity,0);
 assert.equal(clipAppearance(2.5,{start:2,end:3},{enter:'fade',exit:'fade'}).opacity,1);
 assert.equal(clipAppearance(3,{start:2,end:3},{enter:'none',exit:'fade'}).opacity,0);
 assert.ok(clipAppearance(2,{start:2,end:2.1},{enter:'zoom',exit:'none'}).scale>1);
});
