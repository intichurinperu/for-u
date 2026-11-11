import test from 'node:test';
import assert from 'node:assert/strict';
import {captionWav} from '../src/toolkit/captionAudio.ts';
import {captionAudioDuration,parseCaptions} from '../../supabase/functions/toolkit-ai/transcription.ts';
import {geminiGenerate} from '../../supabase/functions/toolkit-ai/core.ts';
test('speech payload is bounded mono PCM WAV with server-derived duration',()=>{
 const wav=captionWav([new Float32Array(48000).fill(.5),new Float32Array(48000).fill(-.5)],48000);
 assert.equal(wav.byteLength,32044);assert.equal(captionAudioDuration(new Uint8Array(wav)),1);assert.equal(new DataView(wav).getInt16(44,true),0);
 const bad=new Uint8Array(wav.slice(0));bad[22]=2;assert.throws(()=>captionAudioDuration(bad));assert.throws(()=>captionAudioDuration(new Uint8Array(wav,0,200)));assert.throws(()=>captionWav([new Float32Array(8000*181)],8000));
});
test('transcription cannot invent malformed timestamps or silently drop partial rows',()=>{
 assert.deepEqual(parseCaptions({segments:[]},4),[]);
 const rows=[{start:0,end:1,text:' Hola '},{start:1.4,end:2,text:'mi voz'}];assert.equal(parseCaptions({segments:rows},3)[0].text,'Hola');
 for(const segments of [[{start:0,end:4,text:'too long'}],[{start:-1,end:1,text:'bad'}],[{start:0,end:1,text:''}],[{start:0,end:1,text:'ok'},{start:.5,end:2,text:'overlap'}],[{start:NaN,end:2,text:'bad'}]])assert.throws(()=>parseCaptions({segments},3));
});
test('Gemini audio transcription requests structured bounded output and never sends camera frames',async()=>{
 let body;const result=await geminiGenerate({key:'fake',model:'configured-model',instruction:'transcribe only audio',content:{durationSeconds:1},attachments:[{mimeType:'audio/wav',data:'test'}],schema:{type:'object'},maxOutputTokens:12000,parseStructured:value=>parseCaptions(value,1)},async(_url,init)=>{body=JSON.parse(init.body);return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({segments:[{start:0,end:.9,text:'Hola'}]})}]}}]}));});
 assert.equal(body.contents[0].parts[1].inlineData.mimeType,'audio/wav');assert.equal(body.generationConfig.maxOutputTokens,12000);assert.deepEqual(result.structured,[{start:0,end:.9,text:'Hola'}]);
});
