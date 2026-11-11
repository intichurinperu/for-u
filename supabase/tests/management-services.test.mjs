import { readFile } from 'node:fs/promises';
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.PGLITE_MODULE_PATH||'@electric-sql/pglite');
const db=new PGlite();after(()=>db.close());
await db.exec(`create role anon;create role authenticated;create role service_role;
create schema auth;create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema public,auth to anon,authenticated,service_role;
grant execute on function auth.uid() to anon,authenticated;
alter default privileges in schema public grant execute on functions to anon,authenticated;
create table projects(id uuid primary key,user_id uuid,unique(id,user_id));
create table toolkit_sites(id uuid primary key,user_id uuid not null,project_id uuid not null,slug text unique,content jsonb,published boolean,unique(id,user_id),foreign key(project_id,user_id) references projects(id,user_id));
grant select on toolkit_sites,projects to authenticated;
alter table projects enable row level security;create policy project_owner on projects to authenticated using(user_id=auth.uid());
alter table toolkit_sites enable row level security;create policy site_owner on toolkit_sites to authenticated using(user_id=auth.uid());`);
const migration=await readFile(new URL('../migrations/24_reservations_uuid.sql',import.meta.url),'utf8');
await db.exec(migration);await db.exec(migration); // Reapplication preserves records and policies.
const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222',projectA='33333333-3333-4333-8333-333333333333',projectB='44444444-4444-4444-8444-444444444444',siteA='55555555-5555-4555-8555-555555555555',siteB='66666666-6666-4666-8666-666666666666',slotA='77777777-7777-4777-8777-777777777777',slotB='88888888-8888-4888-8888-888888888888';
await db.query('insert into auth.users values($1),($2)',[alice,bob]);await db.query('insert into projects values($1,$2),($3,$4)',[projectA,alice,projectB,bob]);
await db.query(`insert into toolkit_sites values($1,$2,$3,'qa-a','{"bookingEnabled":true}',true),($4,$5,$6,'qa-b','{"bookingEnabled":false}',true)`,[siteA,alice,projectA,siteB,bob,projectB]);
async function as(user,sql,args=[]){await db.exec('reset role;set role '+(user?'authenticated':'anon'));await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user||'']);return db.query(sql,args);}
for(const [slot,site,user] of [[slotA,siteA,alice],[slotB,siteB,bob]])await as(user,"insert into reservation_slots(id,user_id,site_id,starts_at,ends_at) values($1,$2,$3,now()+interval '2 days',now()+interval '2 days 30 minutes')",[slot,user,site]);
const req1='99999999-9999-4999-8999-999999999999',req2='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
async function book(request,slug='qa-a',slot=slotA,email='qa@example.test'){return (await as(null,'select book_reservation($1,$2,$3,$4,$5,$6) as result',[slug,slot,'QA visitor',email,'51999999999',request])).rows[0].result;}
let reservation;
// Exercise the existing production analytics functions, not a duplicate implementation.
await db.exec('reset role');
const sql14=await readFile(new URL('../migrations/14_site_analytics.sql',import.meta.url),'utf8');
await db.exec(sql14.slice(0,sql14.indexOf('create or replace function public.site_analytics_summary')));
await db.exec(`create table module_sites(id uuid primary key,user_id uuid,project_id uuid,slug text,published boolean);
create table module_site_analytics(id uuid primary key,site_id uuid,user_id uuid,visitor_id uuid,event_type text,page_path text,referrer text,created_at timestamptz default now());
alter table module_site_analytics enable row level security;grant select on module_site_analytics to authenticated;
create policy module_owner on module_site_analytics to authenticated using(user_id=auth.uid());`);
const sql21=await readFile(new URL('../migrations/21_workspace_services_uuid.sql',import.meta.url),'utf8');
await db.exec(sql21.slice(sql21.indexOf('create or replace function public.record_module_analytics'),sql21.lastIndexOf("notify pgrst")));
await db.exec(await readFile(new URL('../migrations/25_analytics_private_summary.sql',import.meta.url),'utf8'));
await db.query("insert into module_sites values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',$1,$2,'qa-module',true)",[alice,projectA]);

test('owner isolation, public availability and explicit defaults deny private access',async()=>{
 assert.equal((await as(null,"select * from public_reservation_slots('qa-a')")).rows.length,1);
 assert.equal((await as(null,"select * from public_reservation_slots('qa-b')")).rows.length,0);
 assert.equal((await as(bob,'select * from reservation_slots where site_id=$1',[siteA])).rows.length,0);
 await assert.rejects(as(null,'select * from reservations'),/permission denied/);
 await assert.rejects(as(null,'select reservation_slot_guard()'),/permission denied/);
 await assert.rejects(as(bob,"insert into reservation_slots(user_id,site_id,starts_at,ends_at) values($1,$2,now()+interval '3 days',now()+interval '3 days 30 minutes')",[bob,siteA]),/foreign key/);
 await assert.rejects(as(alice,"insert into reservation_slots(user_id,site_id,starts_at,ends_at) values($1,$2,now()+interval '3 days',now()+interval '3 days 10 minutes')",[alice,siteA]),/check constraint/);
});
test('booking persists with pending notification; retry is idempotent and full slots reject new requests',async()=>{
 reservation=await book(req1);assert.equal(reservation.status,'confirmed');assert.equal((await book(req1)).id,reservation.id);
 await assert.rejects(book(req2),/completo/);await assert.rejects(book(req1,'qa-a',slotA,'other@example.test'),/Solicitud inválida/);
 assert.equal((await as(null,"select * from public_reservation_slots('qa-a')")).rows[0].remaining,0);
 const rows=(await as(alice,'select * from reservations')).rows;assert.equal(rows.length,1);assert.equal((await as(bob,'select * from reservations')).rows.length,0);
 assert.equal((await as(alice,'select * from reservation_notifications')).rows[0].status,'pending');
 assert.equal((await as(bob,'select * from reservation_notifications')).rows.length,0);
 await assert.rejects(as(alice,'update reservations set customer_email=$1 where id=$2',['forged@example.test',reservation.id]),/permission denied/);
 await assert.rejects(book(req2,'qa-b',slotA),/disponible/);
});
test('cancel/reopen, capacity guards and closed slots preserve booking integrity',async()=>{
 await as(alice,"update reservations set status='cancelled' where id=$1",[reservation.id]);
 assert.equal((await as(null,"select * from public_reservation_slots('qa-a')")).rows[0].remaining,1);
 const second=await book(req2);await assert.rejects(as(alice,"update reservations set status='confirmed' where id=$1",[reservation.id]),/cupos/);
 await assert.rejects(as(alice,"update reservation_slots set starts_at=starts_at+interval '1 day',ends_at=ends_at+interval '1 day' where id=$1",[slotA]),/no puede cambiar/);
 await as(alice,"update reservations set status='cancelled' where id=$1",[second.id]);await as(alice,"update reservations set status='confirmed' where id=$1",[reservation.id]);
 await as(alice,'update reservation_slots set enabled=false where id=$1',[slotA]);assert.equal((await as(null,"select * from public_reservation_slots('qa-a')")).rows.length,0);
 await as(alice,'update reservation_slots set enabled=true where id=$1',[slotA]);
 await db.exec('reset role');await db.query('update toolkit_sites set published=false where id=$1',[siteA]);assert.equal((await as(null,"select * from public_reservation_slots('qa-a')")).rows.length,0);
 await db.exec('reset role');await db.query('update toolkit_sites set published=true where id=$1',[siteA]);
});

test('valid empty metrics are zero; summaries reject anonymous and foreign projects',async()=>{
 await assert.rejects(as(null,'select site_analytics_summary($1)',[projectA]),/permission denied/);
 await assert.rejects(as(bob,'select site_analytics_summary($1)',[projectA]),/Proyecto no disponible/);
 const empty=(await as(bob,'select site_analytics_summary($1) as result',[projectB])).rows[0].result;
 assert.equal(empty.page_views,0);assert.equal(empty.cta_clicks,0);assert.equal(empty.daily.length,7);assert.ok(empty.daily.every(d=>d.views===0));
});
test('controlled public visits/clicks reach own summary once and combine both page types',async()=>{
 const visitor='cccccccc-cccc-4ccc-8ccc-cccccccccccc',event='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
 for(let i=0;i<2;i++)await as(null,"select record_site_analytics('qa-a',$1,$2,'page_view','/s/qa-a','direct')",[event,visitor]);
 await as(null,"select record_site_analytics('qa-a',$1,$2,'cta_click','/s/qa-a','direct')",['eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',visitor]);
 await as(null,"select record_module_analytics('qa-module',$1,$2,'page_view','/negocio/qa-module','direct')",['ffffffff-ffff-4fff-8fff-ffffffffffff',visitor]);
 const metrics=(await as(alice,'select site_analytics_summary($1) as result',[projectA])).rows[0].result;
 assert.equal(metrics.page_views,2);assert.equal(metrics.cta_clicks,1);assert.equal(metrics.unique_visitors,1);assert.equal(metrics.pages.length,2);assert.equal(metrics.daily.reduce((n,d)=>n+d.views,0),2);
 assert.equal((await as(bob,'select site_analytics_summary($1) as result',[projectB])).rows[0].result.page_views,0);
 await assert.rejects(as(null,'select * from site_analytics'),/permission denied/);
 await assert.rejects(as(null,"select record_site_analytics('qa-a',$1,$2,'sale','/s/qa-a','direct')",['abababab-abab-4bab-8bab-abababababab',visitor]),/Evento inválido/);
});
