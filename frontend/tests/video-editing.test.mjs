import test from 'node:test';
import assert from 'node:assert/strict';
import {readSrt,validCaptionTimes} from '../src/toolkit/videoEditing.ts';
test('SRT imports preserve Spanish text and precise times while removing HTML',()=>{
 const rows=readSrt('\uFEFF1\r\n00:00:00,100 --> 00:00:01,250\r\nHola, <b>café</b>.\r\n\r\n2\r\n00:00:01,300 --> 00:00:02,500\r\nUna pausa\r\npara conversar.');
 assert.deepEqual(rows,[{start:.1,end:1.25,text:'Hola, café.'},{start:1.3,end:2.5,text:'Una pausa\npara conversar.'}]);assert.equal(validCaptionTimes(rows,3),true);assert.equal(validCaptionTimes(rows,2),false);
});
test('invalid or incomplete captions cannot be presented as a valid export',()=>{
 for(const text of ['', '1\n00:00:02,000 --> 00:00:01,000\nHola','1\nno son tiempos\nHola','1\n00:00:00,000 --> 00:00:01,000\n','x'.repeat(300001)])assert.throws(()=>readSrt(text));
 for(const row of [{start:-1,end:2,text:'Hola'},{start:0,end:NaN,text:'Hola'},{start:0,end:1,text:' '},{start:1,end:1,text:'Hola'}])assert.equal(validCaptionTimes([row],3),false);
});
