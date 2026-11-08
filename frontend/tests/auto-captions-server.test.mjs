import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
import * as core from '../../supabase/functions/toolkit-ai/core.ts';
import * as captions from '../../supabase/functions/toolkit-ai/transcription.ts';
import * as creative from '../../supabase/functions/toolkit-ai/creative.ts';
import {captionWav} from '../src/toolkit/captionAudio.ts';
const projectId='11111111-1111-4111-8111-111111111111';
function endpoint({owner=true,provider='gemini',quota=true}={}){
 let handler,calls=0,quotaCalls=0;const env={FORU_AI_PROVIDER:provider,FORU_AI_FREE_TIER_CONFIRMED:'true',GEMINI_API_KEY:'fake',SUPABASE_URL:'https://example.invalid',SUPABASE_ANON_KEY:'fake'};
 const db={auth:{getUser:async()=>({data:{user:{id:'owner'}},error:null})},rpc:async()=>{quotaCalls++;return {data:quota,error:null};},from(){const filters={};const query={select(){return query;},eq(k,v){filters[k]=v;return query;},maybeSingle:async()=>({data:owner&&filters.user_id==='owner'&&filters.id===projectId?{id:projectId}:null,error:null})};return query;}};
 const source=fs.readFileSync(new URL('../../supabase/functions/toolkit-ai/index.ts',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
 const script=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 const scope={...core,...captions,...creative,sharedRequest:(_db,_user,_project,_action,_key,work)=>work(),geminiGenerate:async(input)=>{
  calls++;
  if(input.content.operation==='layout'){
   assert.deepEqual(input.schema,creative.creativeSchema('layout'));
   assert.equal(input.content.request,'Este viernes vuelve el brownie');
   const structured=input.parseStructured({title:'Vuelve el brownie',text:'Este viernes.',cta:'Visítanos',templateId:'pearl'});
   return {structured,usage:{input:0,output:0}};
  }
  assert.equal(input.attachments[0].mimeType,'audio/wav');assert.deepEqual(input.content,{durationSeconds:1});return {structured:[{start:0,end:.9,text:'Hola'}],usage:{input:0,output:0}};
 }};
 new Function('Deno','createClient',...Object.keys(scope),script)({env:{get:k=>env[k]},serve:fn=>handler=fn},()=>db,...Object.values(scope));
 const send=body=>handler(new Request('https://example.invalid',{method:'POST',headers:{Authorization:'Bearer fake'},body}));
 return {async request(valid=true){const body=new FormData();body.set('action','transcribe');body.set('projectId',projectId);body.set('file',new File([valid?captionWav([new Float32Array(16000)],16000):new Uint8Array(100)],'voz.wav',{type:'audio/wav'}));return send(body);},
  idea:prompt=>send(JSON.stringify({action:'idea-design',projectId,prompt})),counts:()=>({calls,quotaCalls})};
}
test('multipart transcription verifies project ownership and WAV before quota or provider',async()=>{for(const [options,valid,status] of [[{owner:false},true,403],[{},false,400],[{provider:'disabled'},true,503]]){const api=endpoint(options);assert.equal((await api.request(valid)).status,status);assert.deepEqual(api.counts(),{calls:0,quotaCalls:0});}});
test('quota blocks transcription; authorized audio returns actual structured segments',async()=>{const blocked=endpoint({quota:false});assert.equal((await blocked.request()).status,429);assert.equal(blocked.counts().calls,0);const api=endpoint();const response=await api.request();assert.equal(response.status,200);assert.deepEqual((await response.json()).segments,[{start:0,end:.9,text:'Hola'}]);assert.deepEqual(api.counts(),{calls:1,quotaCalls:1});});
test('a free idea returns a validated layout only for an owned project and after checking quota',async()=>{
 const idea='Este viernes vuelve el brownie';
 const forbidden=endpoint({owner:false});
 assert.equal((await forbidden.idea(idea)).status,403);
 assert.deepEqual(forbidden.counts(),{calls:0,quotaCalls:0});
 const api=endpoint();
 assert.equal((await api.idea('  ')).status,400);
 assert.deepEqual(api.counts(),{calls:0,quotaCalls:0});
 const response=await api.idea(idea);
 assert.equal(response.status,200);
 assert.deepEqual((await response.json()).structured,{title:'Vuelve el brownie',text:'Este viernes.',cta:'Visítanos',templateId:'pearl'});
 assert.deepEqual(api.counts(),{calls:1,quotaCalls:1});
});
