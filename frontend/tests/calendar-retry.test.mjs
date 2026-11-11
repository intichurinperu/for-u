import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarICS,upsertCalendarActivity} from '../src/toolkit/calendarModel.ts';
test('a failed write retry updates the same activity without duplicating or resetting completion',()=>{
 const original=[{id:'prior',title:'Existing',date:'2026-10-23',time:'10:00',format:'manual',done:true,remindedAt:'old'}];
 const local=upsertCalendarActivity(original,'retry-id',{title:' New activity ',date:'2026-10-24',time:'12:00'});
 const retry=upsertCalendarActivity(local,'retry-id',{title:'Corrected activity',date:'2026-10-25',time:'13:00'});
 assert.equal(retry.length,2);assert.equal(retry[1].id,'retry-id');assert.equal(retry[1].title,'Corrected activity');assert.deepEqual(retry[0],original[0]);assert.equal(original.length,1);
 const changed=upsertCalendarActivity(retry,'prior',{title:'Kept completion',date:'2026-10-26',time:'11:00'});assert.equal(changed[0].done,true);assert.equal(changed[0].remindedAt,'old');
 assert.throws(()=>upsertCalendarActivity(changed,'other',{title:'Invalid',date:'2026-02-30',time:'12:00'}));assert.equal(changed.length,2);
});

test('export includes planned pieces and tasks with distinct source UIDs and no invented hour',()=>{
 const task={id:'same-reference',title:'A task',date:'2026-10-24',done:false},piece={id:'same-reference',title:'My reel cover',date:'2026-10-25'};
 const ics=calendarICS([],new Date('2026-10-23T12:00:00Z'),[task],[piece]);
 assert.match(ics,/UID:task-same-reference@foru/);assert.match(ics,/UID:piece-same-reference@foru/);assert.match(ics,/DTSTART;VALUE=DATE:20261025/);assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,2);assert.equal(piece.date,'2026-10-25');assert.equal(task.done,false);
 assert.throws(()=>calendarICS([],new Date(),[],[{...piece,date:'2026-02-30'}]));
});

test('the initial agenda includes tomorrow on Sunday while the optional week keeps its Monday boundary',async()=>{
 const {calendarWindow}=await import('../src/toolkit/calendarModel.ts');
 const anchor=new Date(2026,9,25,17,30),before=anchor.getTime();
 const dates=calendarWindow(anchor,'agenda');
 assert.equal(dates[0].getDate(),25);assert.ok(dates.some(day=>day.getDate()===26));assert.equal(dates[6].getDate(),31);
 const week=calendarWindow(anchor,'week');assert.equal(week[0].getDay(),1);assert.equal(week[6].getDate(),25);
 assert.equal(anchor.getTime(),before);assert.ok(dates.every(day=>day.getHours()===0));
});
test('the agenda crosses a year without UTC shifts or changing its anchor',async()=>{
 const {calendarWindow}=await import('../src/toolkit/calendarModel.ts');
 const anchor=new Date(2026,11,30,23,45),dates=calendarWindow(anchor,'agenda');
 assert.deepEqual(dates.map(day=>[day.getFullYear(),day.getMonth()+1,day.getDate()]),[[2026,12,30],[2026,12,31],[2027,1,1],[2027,1,2],[2027,1,3],[2027,1,4],[2027,1,5]]);
 assert.equal(anchor.getDate(),30);assert.throws(()=>calendarWindow(new Date(NaN),'agenda'));
});
