import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const ts=(await import(process.env.TYPESCRIPT_MODULE_PATH||'typescript')).default;
const id='11111111-1111-4111-8111-111111111111';
function database(){
 const tables={reservations:[{id,user_id:'owner',site_id:'site',slot_id:'slot',status:'confirmed',customer_name:'QA',customer_email:'qa@example.test'}],reservation_notifications:[{reservation_id:id,status:'pending',attempts:0,last_attempt_at:null}],reservation_slots:[{id:'slot',user_id:'owner',starts_at:'2026-10-16T15:00:00Z',ends_at:'2026-10-16T15:30:00Z'}],toolkit_sites:[{id:'site',user_id:'owner',content:{name:'QA'}}],integration_connections:[],integration_credentials:[]};
 let failNotification=false,failReservationRead=false;
 return {tables,failNotification(){failNotification=true;},failReservationRead(){failReservationRead=true;},auth:{async getUser(token){return {data:{user:token==='session'?{id:'owner'}:null}};}},async rpc(){return {data:{id,status:'confirmed'},error:null};},from(table){
  let filters=[],op='select',values;
  const q={select(){return q;},eq(k,v){filters.push([k,v]);return q;},is(k,v){filters.push([k,v]);return q;},delete(){op='delete';return q;},update(v){op='update';values=v;return q;},upsert(v){op='upsert';values=v;return q;},single(){return run(true);},maybeSingle(){return run(true);},then(a,b){return run(false).then(a,b);}};
  async function run(single){
   if(failReservationRead&&table==='reservations'&&op==='select')return {data:null,error:{code:'network'}};
   if(failNotification&&table==='reservation_notifications'&&op==='update'&&values.status)return {data:null,error:{code:'network'}};
   const matches=tables[table].filter(row=>filters.every(([k,v])=>row[k]===v));
   if(op==='delete')tables[table]=tables[table].filter(r=>!matches.includes(r));
   if(op==='update')matches.forEach(r=>Object.assign(r,values));
   if(op==='upsert'){const previous=tables[table].find(r=>r.user_id===values.user_id&&r.provider===values.provider);if(previous)Object.assign(previous,values);else tables[table].push({...values});}
   return {data:single?structuredClone(matches[0]??null):structuredClone(matches),error:null};
  }return q;
 }};
}
async function handler(name,db,fetchImpl,mail=true){
 let callback;const src=(await readFile(new URL('../functions/'+name+'/index.ts',import.meta.url),'utf8')).replace(/^import .*\n/,'');
 const compiled=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None},reportDiagnostics:true});
 assert.equal(compiled.diagnostics?.length??0,0);
 vm.runInNewContext(compiled.outputText,{createClient:()=>db,Deno:{serve(fn){callback=fn;},env:{get(k){if(k==='RESEND_API_KEY'||k==='RESERVATIONS_FROM_EMAIL')return mail?'fixture':undefined;return 'fixture';}}},fetch:fetchImpl,Request,Response,Headers,AbortSignal,Date,JSON,console});return callback;
}
const request=body=>new Request('https://example.test/function',{method:'POST',headers:{Authorization:'Bearer session','Content-Type':'application/json'},body:JSON.stringify(body)});
test('saved reservation survives notification failure and never reports unsaved',async()=>{
 const db=database(),fn=await handler('reservations',db,async()=>{throw Error('offline');});const r=await fn(request({action:'create',slug:'qa',slotId:'slot',name:'QA',email:'qa@example.test',phone:'51999999999',requestId:id}));assert.equal(r.status,200);assert.deepEqual(await r.json(),{id,emailStatus:'pending'});
});
test('booking receipt survives a failed status read after the booking transaction committed',async()=>{
 const db=database();db.failReservationRead();const fn=await handler('reservations',db,async()=>{throw Error('must not send');});
 const r=await fn(request({action:'create',slug:'qa',slotId:'slot',name:'QA',email:'qa@example.test',phone:'51999999999',requestId:id}));assert.equal(r.status,200);assert.deepEqual(await r.json(),{id,emailStatus:'pending'});assert.equal(db.tables.reservations[0].status,'confirmed');
});
test('missing mail configuration and failed persistence do not claim sent',async()=>{
 const db=database();const fn=await handler('reservations',db,async()=>{throw Error('must not send');},false);assert.equal((await (await fn(request({action:'retry-email',id}))).json()).emailStatus,'pending');
 const db2=database();db2.failNotification();const fn2=await handler('reservations',db2,async()=>new Response(JSON.stringify({id:'provider-id'}),{status:200}));assert.equal((await (await fn2(request({action:'retry-email',id}))).json()).emailStatus,'pending');
});
test('conditional notification lease and provider idempotency prevent parallel sends',async()=>{
 const db=database();let sends=0;const fn=await handler('reservations',db,async(url,init)=>{sends++;assert.equal(init.headers['Idempotency-Key'],'foru-reservation-'+id);return new Response(JSON.stringify({id:'provider-id'}),{status:200});});
 const responses=await Promise.all([fn(request({action:'retry-email',id})),fn(request({action:'retry-email',id}))]);assert.equal(sends,1);assert.ok((await Promise.all(responses.map(r=>r.json()))).some(r=>r.emailStatus==='sent'));assert.equal(db.tables.reservation_notifications[0].status,'sent');
});
test('integration verifies actual response, keeps credentials private and disconnects them',async()=>{
 const db=database(),fn=await handler('integrations',db,async()=>new Response(JSON.stringify({resource:{uri:'fixture',name:'QA provider'}}),{status:200}));
 const result=await (await fn(request({action:'connect',provider:'calendly',accessToken:'fixture-private-token'}))).json();assert.equal(result.connected,true);assert.equal(result.verification_state,'verified');assert.ok(!JSON.stringify(result).includes('fixture-private-token'));
 const removed=await (await fn(request({action:'disconnect',provider:'calendly'}))).json();assert.equal(removed.connected,false);assert.equal(db.tables.integration_credentials.length,0);assert.equal(db.tables.integration_connections.length,0);
});
test('provider expiration, insufficient permissions and network error are distinct',async()=>{
 for(const [status,state] of [[401,'expired'],[403,'error']]){const db=database(),fn=await handler('integrations',db,async()=>new Response('{}',{status}));const result=await (await fn(request({action:'connect',provider:'calendly',accessToken:'fixture-private-token'}))).json();assert.equal(result.connected,false);assert.equal(result.verification_state,state);}
 const db=database(),fn=await handler('integrations',db,async()=>{throw Error('offline');});assert.equal((await fn(request({action:'connect',provider:'calendly',accessToken:'fixture-private-token'}))).status,502);
 const unauth=new Request('https://example.test',{method:'POST',body:'{}'});assert.equal((await fn(unauth)).status,401);
});
