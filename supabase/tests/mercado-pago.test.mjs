import {readFile} from 'node:fs/promises';
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const db=new PGlite();after(()=>db.close());
await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;alter default privileges in schema public grant execute on functions to anon,authenticated;
create table projects(id uuid primary key,user_id uuid,unique(id,user_id));create table module_sites(id uuid primary key,user_id uuid,project_id uuid,module_type text,slug text,content jsonb,published boolean,revision uuid default gen_random_uuid());create table toolkit_sites(id uuid primary key,user_id uuid,project_id uuid,slug text,content jsonb,published boolean,revision uuid default gen_random_uuid());`);
for(const file of ['26_restaurant_orders.sql','27_mercado_pago.sql','27_mercado_pago.sql','28_mercado_pago_free_orders.sql'])await db.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
const owner='11111111-1111-4111-8111-111111111111',foreign='22222222-2222-4222-8222-222222222222',customer='33333333-3333-4333-8333-333333333333',project='44444444-4444-4444-8444-444444444444',other='55555555-5555-4555-8555-555555555555',site='66666666-6666-4666-8666-666666666666',moduleSite='77777777-7777-4777-8777-777777777777';
await db.query('insert into auth.users values($1),($2),($3)',[owner,foreign,customer]);await db.query('insert into projects values($1,$2),($3,$4)',[project,owner,other,foreign]);
const offers=[{id:'coffee',name:'Café QA',kind:'product',price:6,pricing:'fixed',conditions:'Una unidad',variants:[{id:'big',name:'Grande',price:8,available:true}],extras:[{id:'wrap',name:'QA',price:1,available:true}]},{id:'service',name:'Servicio QA',kind:'service',price:null,pricing:'quote'},{id:'stay',name:'Noche QA',kind:'stay',price:100,pricing:'fixed',conditions:'Precio por noche; coordinar fechas'},{id:'free',name:'Guía QA',kind:'course',price:0,pricing:'free'}];
await db.query("insert into toolkit_sites(id,user_id,project_id,slug,content,published) values($1,$2,$3,'qa',$4,true)",[site,owner,project,{name:'Negocio QA',offers}]);
await db.query("insert into module_sites(id,user_id,project_id,module_type,slug,content,published) values($1,$2,$3,'restaurant','qa-menu',$4,true)",[moduleSite,owner,project,{menu:{settings:{title:'QA'},dishes:[{id:'coffee',name:'Café QA',price:6,available:true}]}}]);
async function as(user,sql,args=[],role){await db.exec('reset role;set role '+(role||(user?'authenticated':'anon')));await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user||'']);return (await db.query(sql,args)).rows;}
async function service(sql,args=[]){return as(null,sql,args,'service_role');}
const select=(id='coffee')=>[{id:'line',offerId:id,quantity:2,variantId:id==='coffee'?'big':null,extraIds:id==='coffee'?['wrap']:[],note:'QA',price:0}];
const quote=async(id='coffee')=>(await as(null,"select commerce_quote('qa','toolkit',$1) r",[select(id)]))[0].r;
const token='a'.repeat(64);let order,quoted,config,attempt;
const create=async(id='coffee')=>{const q=await quote(id);return (await as(null,"select commerce_create('qa','toolkit',$1,'QA','qa@testuser.com','51999999999',gen_random_uuid(),$2,$3) r",[select(id),token,q]))[0].r;};
test('catalogue pricing cannot be overridden and published variants/extras are charged',async()=>{const q=await quote();assert.equal(q.totalCents,1800);assert.equal(q.items[0].unitCents,900);await assert.rejects(as(null,"select commerce_quote('qa','toolkit',$1)",[[{...select()[0],variantId:'other'}]]));await assert.rejects(as(null,"select commerce_quote('qa','toolkit',$1)",[[{...select()[0],offerId:'other'}]]));assert.equal((await quote('service')).totalCents,null);assert.equal((await quote('stay')).needsConfirmation,true);});
test('guest checkout and frozen retry preserve the exact order without exposing customer contact',async()=>{const q=await quote();const request=crypto.randomUUID();const args=[select(),request,token,q];const sql="select commerce_create('qa','toolkit',$1,'QA','qa@testuser.com','51999999999',$2,$3,$4) r";order=(await as(null,sql,args))[0].r;assert.equal((await as(null,sql,args))[0].r.id,order.id);assert.ok(!JSON.stringify(order).includes('qa@testuser.com'));assert.equal((await as(null,'select commerce_track($1,$2) r',[order.id,token]))[0].r.totalCents,1800);await assert.rejects(as(null,'select commerce_track($1,$2)',[order.id,'b'.repeat(64)]));await assert.rejects(as(null,sql,[select(),request,token,{...q,totalCents:1}]),/incompatible/);});
test('owner configuration, OAuth state consumption and binding preserve isolation',async()=>{
 await assert.rejects(as(foreign,'select payment_config($1)',[project]));await assert.rejects(as(owner,'select payment_config($1,$2)',[project,{mode:'required',environment:'test'}]),/Autoriza/);
 await service('select payment_oauth_finish($1,$2,$3,$4,$5,$6,now()+interval \'1 day\')',[project,owner,'test','123','Vendedor QA','encrypted']);
 config=(await as(owner,'select payment_config($1,$2,null) r',[project,{mode:'required',environment:'test'}]))[0].r;assert.equal(config.mode,'required');assert.ok(!JSON.stringify(config).includes('encrypted'));
 await assert.rejects(as(owner,'select payment_config($1,$2,null)',[project,{mode:'optional',environment:'test'}]),/cambió/);
 await db.exec('reset role');await db.query('insert into payment_oauth_sessions values($1,$2,$3,$4,$5,now()+interval \'10 minutes\',null)',['state',project,owner,'test','cipher']);
 assert.equal((await service("select payment_oauth_claim('state') r"))[0].r.user_id,owner);await assert.rejects(service("select payment_oauth_claim('state')"),/utilizó/);
});
test('quotes require client acceptance of current revision; fixed prices stay immutable',async()=>{
 quoted=await create('service');assert.equal(quoted.status,'awaiting_quote');await assert.rejects(service('select payment_begin($1,$2,null,$3,$4)',['commerce',quoted.id,token,'qa@testuser.com']),/no está/);
 quoted=(await as(owner,'select commerce_manage($1,$2,$3,$4) r',[project,quoted.id,{action:'quote',prices:[{offerId:'service',unitCents:12000}],conditions:'Servicio QA confirmado, sin resultados prometidos',expiresAt:new Date(Date.now()+86400000).toISOString()},quoted.revision]))[0].r;assert.equal(quoted.totalCents,24000);
 await assert.rejects(as(null,'select commerce_track($1,$2,$3)',[quoted.id,token,crypto.randomUUID()]),/cambió/);
 quoted=(await as(null,'select commerce_track($1,$2,$3) r',[quoted.id,token,quoted.quoteRevision]))[0].r;assert.equal(quoted.status,'received');assert.equal((await as(null,'select commerce_track($1,$2,$3) r',[quoted.id,token,quoted.quoteRevision]))[0].r.revision,quoted.revision);
 const stay=await create('stay');const prepared=(await as(owner,'select commerce_manage($1,$2,$3,$4) r',[project,stay.id,{action:'quote',prices:[{offerId:'stay',unitCents:1}],conditions:'Dos noches coordinadas QA; precio por noche 100',expiresAt:new Date(Date.now()+86400000).toISOString()},stay.revision]))[0].r;assert.equal(prepared.totalCents,20000);
});
test('one payment attempt across tabs, payload frozen, no automatic work without provider approval',async()=>{
 attempt=(await service('select payment_begin($1,$2,null,$3,$4) r',['commerce',quoted.id,token,'qa@testuser.com']))[0].r;assert.equal((await service('select payment_begin($1,$2,null,$3,$4) r',['commerce',quoted.id,token,'other@testuser.com']))[0].r.id,attempt.id);
 assert.deepEqual((await service('select payment_payload($1,$2) r',[attempt.id,{total:'240.00'}]))[0].r,{total:'240.00'});assert.deepEqual((await service('select payment_payload($1,$2) r',[attempt.id,{total:'1.00'}]))[0].r,{total:'240.00'});
 await assert.rejects(as(owner,'select commerce_manage($1,$2,$3,$4)',[project,quoted.id,{action:'status',status:'accepted'},quoted.revision]),/pago/);
 await assert.rejects(as(owner,'select commerce_manage($1,$2,$3,$4)',[project,quoted.id,{action:'quote',prices:[{offerId:'service',unitCents:1}],conditions:'QA',expiresAt:new Date(Date.now()+86400000).toISOString()},quoted.revision]),/cobro/);
 await assert.rejects(service('select payment_begin($1,$2,$3,null,$4)',['commerce',quoted.id,foreign,'qa@testuser.com']),/no disponible/);
});
test('verified updates are idempotent and late notifications cannot revert approval',async()=>{
 const update=async(state,time,error=null)=>(await service('select payment_apply($1,$2,null,$3,$4,$5) r',[attempt.id,'ORDTSTQA123',state,time,error]))[0].r;
 const now=new Date().toISOString();assert.equal((await update('approved',now)).state,'approved');assert.equal((await update('pending','2020-01-01T00:00:00Z')).state,'approved');assert.equal((await update('unknown',null,'Network')).state,'approved');
 quoted=(await as(owner,'select commerce_manage($1,$2,$3,$4) r',[project,quoted.id,{action:'status',status:'accepted'},quoted.revision]))[0].r;assert.equal(quoted.status,'accepted');
 assert.equal((await update('refunded',new Date(Date.now()+1000).toISOString())).state,'refunded');await assert.rejects(service('select payment_apply($1,$2,null,$3,now(),null)',[attempt.id,'ORDTSTOTHER','pending']),/incompatible/);
});
test('new restaurant orders reuse their existing record and mandatory payment is enforced on server',async()=>{
 await as(owner,'select restaurant_order_config($1,$2)',[project,{enabled:true,modes:['pickup'],tables:[],zones:[]}]);
 const lines=[{id:'c',dishId:'coffee',quantity:1,extraIds:[],note:''}];const r=(await as(null,"select restaurant_order_create('qa-menu',$1,$2,'QA','51999999999',gen_random_uuid(),$3,600) r",[lines,{mode:'pickup'},token]))[0].r;
 await assert.rejects(as(owner,'select restaurant_order_manage($1,$2,$3,$4)',[project,r.id,'accepted',r.revision]),/pago/);
 const a=(await service('select payment_begin($1,$2,null,$3,$4) r',['restaurant',r.id,token,'qa@testuser.com']))[0].r;assert.equal(a.total_cents,600);
 await service('select payment_apply($1,$2,null,$3,now(),null)',[a.id,'ORDTSTRESTAURANT','approved']);assert.equal((await as(owner,'select restaurant_order_manage($1,$2,$3,$4) r',[project,r.id,'accepted',r.revision]))[0].r.status,'accepted');
});
test('private tables, OAuth operations and payment mutation RPCs denied to public roles',async()=>{
 for(const role of ['anon','authenticated']){for(const t of ['payment_connections','payment_attempts','payment_oauth_sessions','commerce_orders'])await assert.rejects(as(owner,'select * from '+t,[],role),/permission denied/);await assert.rejects(as(owner,"select payment_oauth_claim('state')",[],role),/permission denied/);await assert.rejects(as(owner,'select payment_apply($1,$2,null,$3,now(),null)',[attempt.id,'ORDTSTQA123','approved'],role),/permission denied/);}
 await assert.rejects(as(foreign,'select commerce_manage($1)',[project]),/no disponible/);await assert.rejects(as(owner,'select commerce_manage($1,$2)',[other,quoted.id]),/no disponible/);
});
test('explicitly free restaurant orders never request a charge, even in required mode',async()=>{
 await db.exec('reset role');await db.query("update module_sites set content=jsonb_set(content,'{menu,dishes,0,price}','0') where id=$1",[moduleSite]);
 const r=(await as(null,"select restaurant_order_create('qa-menu',$1,$2,'QA gratis','51999999999',gen_random_uuid(),$3,0) r",[[{id:'free',dishId:'coffee',quantity:1,extraIds:[],note:''}],{mode:'pickup'},token]))[0].r;
 assert.equal(r.totalCents,0);assert.equal((await as(owner,'select restaurant_order_manage($1,$2,$3,$4) r',[project,r.id,'accepted',r.revision]))[0].r.status,'accepted');await assert.rejects(service('select payment_begin($1,$2,null,$3,$4)',['restaurant',r.id,token,'qa@testuser.com']),/no está/);
});
