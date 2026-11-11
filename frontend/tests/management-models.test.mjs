import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDateTime,calendarICS,readCalendar } from '../src/toolkit/calendarModel.ts';
import { connectionState } from '../src/toolkit/connectionModel.ts';
import { readAnalyticsSummary } from '../src/toolkit/analyticsModel.ts';
const entry={id:crypto.randomUUID(),title:'Café, alfajores; reunión 🧡 '.repeat(8),date:'2026-10-15',time:'10:30',format:'contenido',done:false};
test('calendar rejects impossible dates and unknown documents without replacing them',()=>{
 assert.throws(()=>calendarDateTime('2026-02-30','10:00')); assert.throws(()=>calendarDateTime('2026-10-15','24:10'));
 assert.throws(()=>readCalendar({version:9}));assert.throws(()=>readCalendar([entry,entry]));assert.deepEqual(readCalendar([entry]),[entry]);
});
test('ICS retains local event instant, escapes/folds UTF8, and skips completed reminders',()=>{
 const ics=calendarICS([entry],new Date('2026-10-14T12:00:00Z'));
 assert.ok(ics.includes('DTSTART:'+calendarDateTime(entry.date,entry.time).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')));
 assert.ok(ics.includes('Café\\, alfajores\\;'));assert.ok(ics.includes('BEGIN:VALARM'));assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
 assert.ok(ics.split('\r\n').every(l=>Buffer.byteLength(l,'utf8')<=75));assert.ok(!calendarICS([{...entry,done:true}]).includes('BEGIN:VALARM'));
});
test('connection distinguishes loading/error/expiration from a valid empty result',()=>{
 const now=Date.parse('2026-10-14T12:00:00Z'), row={provider:'calendly',connected:true,checked_at:new Date(now-1000).toISOString(),verification_state:'verified'};
 assert.equal(connectionState(undefined,now,true),'loading');assert.equal(connectionState(undefined,now,false,true),'unavailable');assert.equal(connectionState(undefined,now),'disconnected');
 assert.equal(connectionState(row,now),'verified');assert.equal(connectionState(row,now+900000),'stale');assert.equal(connectionState({...row,checked_at:new Date(now+10000).toISOString()},now),'stale');
 assert.equal(connectionState({...row,verification_state:undefined},now),'stale');
 assert.equal(connectionState({...row,connected:false,verification_state:'expired'},now),'expired');assert.equal(connectionState({...row,verification_state:'error'},now),'error');assert.equal(connectionState(row,now,false,false,true),'unavailable');
});
test('analytics accepts genuine zero activity but rejects absent and malformed summaries',()=>{
 const zero={unique_visitors:0,page_views:0,cta_clicks:0,pages:[],sources:[],daily:[],updated_at:'2026-10-14T12:00:00Z'};
 assert.deepEqual(readAnalyticsSummary(zero),zero);assert.throws(()=>readAnalyticsSummary(null));assert.throws(()=>readAnalyticsSummary({...zero,page_views:-1}));assert.throws(()=>readAnalyticsSummary({...zero,daily:[{day:'2026-10-14',views:'10',clicks:0}]}));
});
