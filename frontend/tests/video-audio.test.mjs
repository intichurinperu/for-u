import test from 'node:test';import assert from 'node:assert/strict';
import {isolateMp4Audio} from '../src/toolkit/videoAudio.ts';
const text=value=>Uint8Array.from([...value].map(c=>c.charCodeAt(0)));
function box(type,...contents){const size=8+contents.reduce((n,row)=>n+row.length,0),result=new Uint8Array(size);new DataView(result.buffer).setUint32(0,size);result.set(text(type),4);let offset=8;for(const row of contents){result.set(row,offset);offset+=row.length;}return result;}
function track(handler){return box('trak',box('mdia',box('hdlr',new Uint8Array(8),text(handler),new Uint8Array(8))));}
function movie(...tracks){return concat(box('ftyp',text('qt  '),new Uint8Array(4),text('qt  ')),box('moov',...tracks),box('mdat',Uint8Array.from({length:64},(_,i)=>i)));}
function concat(...rows){const out=new Uint8Array(rows.reduce((n,row)=>n+row.length,0));let offset=0;for(const row of rows){out.set(row,offset);offset+=row.length;}return out.buffer;}
test('audio-only MOV carrier keeps all media bytes and offsets while excluding video tracks',()=>{
 const original=movie(track('vide'),track('soun')),before=new Uint8Array(original.slice(0)),result=isolateMp4Audio(original),bytes=new Uint8Array(result);
 assert.equal(result.byteLength,before.length);assert.deepEqual(bytes.slice(-64),before.slice(-64));
 const str=new TextDecoder().decode(bytes);assert.equal(str.match(/trak/g)?.length,1);assert.ok(str.includes('free'));assert.equal(str.slice(8,12),'M4A ');assert.ok(str.includes('soun'));assert.ok(str.includes('isom'));
});
test('non-MP4, truncated containers and video-only files do not pretend to contain an audio track',()=>{
 for(const buffer of [new ArrayBuffer(0),text('not a movie').buffer,movie(track('vide')),movie(track('soun')).slice(0,-5)])assert.equal(isolateMp4Audio(buffer),null);
});
test('only the first audio track is selected, keeping media chunk positions unchanged',()=>{
 const buffer=movie(track('vide'),track('soun'),track('soun'));const size=buffer.byteLength;const result=isolateMp4Audio(buffer);assert.equal(result.byteLength,size);assert.equal(new TextDecoder().decode(result).match(/trak/g)?.length,1);
});
test('fragmented MP4 falls back to the browser decoder instead of rewriting track metadata',()=>{
 const input=concat(box('ftyp',text('isom'),new Uint8Array(4)),box('moov',track('soun')),box('moof',new Uint8Array(8)),box('mdat',new Uint8Array(16)));assert.equal(isolateMp4Audio(input),null);
});
test('a failed video decode retries an audio-only carrier and reuses the same local audio for both actions',async()=>{
 const {decodeAudio}=await import('../src/toolkit/media.ts');const prior=globalThis.AudioContext,original=movie(track('vide'),track('soun'));let calls=0,closed=0,reads=0;
 const decoded={duration:1,sampleRate:16000,numberOfChannels:1,getChannelData:()=>new Float32Array(16000)};
 globalThis.AudioContext=class{resume(){return Promise.resolve();}close(){closed++;return Promise.resolve();}decodeAudioData(buffer){calls++;if(calls===1)return Promise.reject(new Error('Safari video container'));assert.equal(new TextDecoder().decode(buffer).match(/trak/g)?.length,1);return Promise.resolve(decoded);}};
 const file={arrayBuffer:async()=>{reads++;return original.slice(0);}};
 try{assert.equal(await decodeAudio(file),decoded);assert.equal(await decodeAudio(file),decoded);assert.equal(calls,2);assert.equal(reads,2);assert.equal(closed,1);assert.equal(new TextDecoder().decode(original).match(/trak/g)?.length,2);const controller=new AbortController();controller.abort();await assert.rejects(decodeAudio(file,{signal:controller.signal}),{name:'AbortError'});}finally{globalThis.AudioContext=prior;}
});
