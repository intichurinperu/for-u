import {readFile} from 'node:fs/promises';
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const db=new PGlite();after(()=>db.close());
await db.exec(`create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
create table public.projects(id uuid primary key,user_id uuid not null);alter table projects enable row level security;create policy project_owner on projects to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());grant select on projects to authenticated;
create table public.toolkit_sites(project_id uuid primary key references projects(id),user_id uuid not null,slug text unique,content jsonb,published boolean);alter table toolkit_sites enable row level security;create policy site_owner on toolkit_sites to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());grant select,insert,update on toolkit_sites to authenticated;
create table public.toolkit_documents(project_id uuid,payload jsonb);`);
// Match Supabase's explicit default EXECUTE grants, beyond PostgreSQL's PUBLIC default.
await db.exec('alter default privileges in schema public grant execute on functions to anon,authenticated');
await db.exec(await readFile(new URL('../migrations/22_project_widgets_uuid.sql',import.meta.url),'utf8'));
await db.exec(await readFile(new URL('../migrations/23_project_widgets_private_rpc_grants.sql',import.meta.url),'utf8'));
const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222',host='33333333-3333-4333-8333-333333333333',source='44444444-4444-4444-8444-444444444444',other='55555555-5555-4555-8555-555555555555',bobSource='66666666-6666-4666-8666-666666666666';
const offer={id:'offer-1',name:'QA service',kind:'service',pricing:'fixed',price:42,description:'Public text',image:'https://example.com/qa.jpg',conditions:'QA',cost:'PRIVATE_COST',inventory:'PRIVATE_STOCK',variants:[{id:'v1',name:'Public variant',price:12,available:true,cost:'PRIVATE_VARIANT'}],extras:[]};
const content={name:'QA Source',headline:'Public headline',cta:'Contact source',whatsapp:'51999999999',offers:[offer],blocks:[{id:'section-1',title:'Public section',body:'Public body',customers:'PRIVATE_CUSTOMER'}],customers:'PRIVATE_CUSTOMER',privateDraft:'PRIVATE_DRAFT'};
await db.query(`insert into projects values($1,$2),($3,$2),($4,$2),($5,$6)`,[host,alice,source,other,bobSource,bob]);
for(const [id,owner,slug] of [[host,alice,'qa-host'],[source,alice,'qa-source'],[other,alice,'qa-other'],[bobSource,bob,'qa-bob']])await db.query('insert into toolkit_sites values($1,$2,$3,$4,true)',[id,owner,slug,JSON.stringify(content)]);
async function as(user,sql,args=[]){await db.exec('reset role;set role '+(user?'authenticated':'anon'));await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user||'']);return db.query(sql,args);}
const ref=(src=source,kind='offer',id='offer-1')=>({version:1,id:'88888888-8888-4888-8888-888888888888',sourceProject:src,selectionType:kind,selectionId:id,presentation:'embed'});
async function publish(user,project,widgets){return as(user,'update toolkit_sites set content=jsonb_set(content,\'{widgets}\',$2::jsonb) where project_id=$1 returning project_id',[project,JSON.stringify(widgets)]);}
const publicWidgets=async()=> (await as(null,'select toolkit_public_widgets($1) as result',['qa-host'])).rows[0].result;
test('source discovery and preview require host ownership; private helper and grants are protected',async()=>{
 const sources=(await as(alice,'select toolkit_widget_sources($1) as result',[host])).rows[0].result;assert.ok(!sources.some(s=>s.projectId===bobSource));assert.ok(sources.some(s=>s.projectId===source));
 await assert.rejects(as(null,'select toolkit_widget_sources($1)',[host]),/permission denied/);await assert.rejects(as(bob,'select toolkit_widget_sources($1)',[host]),/Proyecto no disponible/);await assert.rejects(as(null,'select toolkit_widget_data($1,$2,$3,$4,$5)',[host,source,'offer','offer-1','embed']),/permission denied/);
 await assert.rejects(as(null,'select toolkit_widget_preview($1,$2,$3,$4,$5)',[host,source,'offer','offer-1','embed']),/permission denied/);
 assert.equal((await as(alice,'select toolkit_widget_preview($1,$2,$3,$4,$5) as result',[host,bobSource,'offer','offer-1','embed'])).rows[0].result,null);
 await assert.rejects(as(alice,'insert into project_widget_grants values($1,$2)',[bobSource,host]),/row-level security/);
});
test('REST publication validates authorization and emits only the selected public whitelist',async()=>{
 await assert.rejects(publish(alice,host,[ref(bobSource)]),/no está publicada o no está autorizada/);
 await publish(alice,host,[ref()]);const data=(await publicWidgets())[0].data;assert.equal(data.offer.price,42);assert.equal(data.contact,'https://wa.me/51999999999');assert.ok(!JSON.stringify(data).includes('PRIVATE'));assert.equal(data.section,undefined);await assert.rejects(as(null,'select * from toolkit_documents'),/permission denied/);
});
test('only publication changes update widgets; withdrawn or removed source content becomes unavailable',async()=>{
 await db.exec('reset role');await db.query('insert into toolkit_documents values($1,$2)',[source,JSON.stringify({price:999,secret:'PRIVATE'})]);assert.equal((await publicWidgets())[0].data.offer.price,42);
 await as(alice,"update toolkit_sites set content=jsonb_set(content,'{offers,0,price}','55') where project_id=$1",[source]);assert.equal((await publicWidgets())[0].data.offer.price,55);
 await as(alice,'update toolkit_sites set published=false where project_id=$1',[source]);assert.equal((await publicWidgets())[0].data,null);await as(alice,'update toolkit_sites set published=true where project_id=$1',[source]);
 await publish(alice,host,[ref(source,'section','section-1')]);assert.deepEqual((await publicWidgets())[0].data.section,{title:'Public section',body:'Public body'});
 await as(alice,"update toolkit_sites set content=jsonb_set(content,'{blocks}','[]') where project_id=$1",[source]);assert.equal((await publicWidgets())[0].data,null);await publish(alice,host,[]);assert.equal((await publicWidgets()).length,0);assert.equal((await as(alice,'select published from toolkit_sites where project_id=$1',[source])).rows[0].published,true);
});
test('explicit sharing and revocation work between accounts and forged references cannot bypass them',async()=>{
 await as(bob,'insert into project_widget_grants values($1,$2)',[bobSource,host]);await publish(alice,host,[ref(bobSource)]);assert.equal((await publicWidgets())[0].data.offer.name,'QA service');await as(bob,'delete from project_widget_grants where source_project=$1 and target_project=$2',[bobSource,host]);assert.equal((await publicWidgets())[0].data,null);await publish(alice,host,[]);
});
test('self references and cycles are rejected; nested widgets are never returned',async()=>{
 await publish(alice,host,[ref()]);await assert.rejects(publish(alice,source,[ref(host)]),/ciclo/);await assert.rejects(publish(alice,host,[ref(host)]),/fuente/);assert.equal((await publicWidgets())[0].data.widgets,undefined);
});

test('publication cannot forge a host owned by another account even with a permissive site foreign key',async()=>{
 await assert.rejects(as(bob,'insert into toolkit_sites values($1,$2,$3,$4,true)',[other,bob,'qa-forged',JSON.stringify({...content,widgets:[ref(bobSource)]})]),/No tienes permiso/);
});
