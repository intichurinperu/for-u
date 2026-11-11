import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
const source=stripTypeScriptTypes((await readFile(new URL('../functions/toolkit-ai/index.ts',import.meta.url),'utf8')).replace(/^import .*createClient.*\n/,''));
function endpoint({user=null,key='server-key-test',allowed=true}={}){
 let handler;const calls=[];
 const context={Request,Response,Headers,FormData,File,AbortSignal,console,JSON,Date,Number,Error,
  Deno:{env:{get(name){return name==='OPENAI_API_KEY'?key:'test'}},serve(fn){handler=fn}},
  createClient(){return {auth:{async getUser(){calls.push('auth');return {data:{user},error:null}}},async rpc(){calls.push('quota');return {data:allowed,error:null}}}},
  async fetch(){calls.push('paid-fetch');throw new Error('Unexpected external request in guard test');}};
 runInNewContext(source,context);return {handler,calls};
}
function request(body={},authorization){return new Request('https://example.invalid/toolkit-ai',{method:'POST',headers:{'Content-Type':'application/json',...(authorization?{Authorization:authorization}:{})},body:JSON.stringify(body)});}
test('AI rejects missing or invalid authentication before quota or paid provider calls',async()=>{
 const {handler,calls}=endpoint();assert.equal((await handler(request())).status,401);assert.deepEqual(calls,[]);
 assert.equal((await handler(request({},'Bearer invalid'))).status,401);assert.deepEqual(calls,['auth']);
});
test('AI rate limit blocks paid calls and missing server secret fails clearly',async()=>{
 const blocked=endpoint({user:{id:'alice'},allowed:false});assert.equal((await blocked.handler(request({action:'caption',prompt:'Test'},'Bearer valid'))).status,429);assert.deepEqual(blocked.calls,['auth','quota']);
 const unset=endpoint({user:{id:'alice'},key:''});assert.equal((await unset.handler(request({},'Bearer valid'))).status,503);assert.ok(!unset.calls.includes('paid-fetch'));
});
test('AI refuses a different account image path and unknown actions',async()=>{
 const api=endpoint({user:{id:'alice'}});
 assert.equal((await api.handler(request({action:'tags',prompt:'Describe',imagePath:'bob/photo.jpg'},'Bearer valid'))).status,403);
 assert.equal((await api.handler(request({action:'run_anything',prompt:'Test'},'Bearer valid'))).status,400);
 assert.ok(!api.calls.includes('paid-fetch'));
});
