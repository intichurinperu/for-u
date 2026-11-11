// Runs the real migration against isolated PostgreSQL/WASM, never the production database.
// PGLITE_MODULE_PATH can point at an existing temporary installation.
import { readFile } from 'node:fs/promises';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
const { PGlite } = await import(process.env.PGLITE_MODULE_PATH || '@electric-sql/pglite');
const db = new PGlite();
after(() => db.close());
await db.exec(`
  create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth; create schema storage;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth, public, storage to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create table public.projects(id text primary key, user_id uuid not null references auth.users(id));
  create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant all on storage.objects to authenticated;
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
`);
await db.exec(await readFile(new URL('../migrations/11_toolkit_ai.sql', import.meta.url), 'utf8'));
for (const file of ['12_public_site_data.sql','13_reservations.sql','14_site_analytics.sql','15_integrations.sql','16_site_assets.sql','17_published_sites.sql','18_module_sites.sql','19_tourism_public_bookings.sql']) await db.exec(await readFile(new URL('../migrations/' + file, import.meta.url), 'utf8'));
const alice = '11111111-1111-4111-8111-111111111111', bob = '22222222-2222-4222-8222-222222222222';
await db.exec(`insert into auth.users values ('${alice}'), ('${bob}'); insert into public.projects values ('alice-project','${alice}'),('bob-project','${bob}');`);
async function asUser(user, sql, params = []) {
  await db.exec(`reset role; set role ${user ? 'authenticated' : 'anon'};`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [user ?? '']);
  return db.query(sql, params);
}
test('documents are private and cross-tenant writes fail', async () => {
  await asUser(alice, `insert into toolkit_documents(user_id,project_id,kind,payload) values ($1,'alice-project','content','{"text":"private"}')`, [alice]);
  assert.equal((await asUser(bob, 'select * from toolkit_documents')).rows.length, 0);
  await assert.rejects(asUser(bob, `insert into toolkit_documents(user_id,project_id,kind) values ($1,'alice-project','forged')`, [alice]), /row-level security/);
  await assert.rejects(asUser(bob, `insert into toolkit_documents(user_id,project_id,kind) values ($1,'alice-project','forged')`, [bob]), /foreign key/);
  assert.equal((await asUser(bob, `update toolkit_documents set payload='{}' where project_id='alice-project' returning *`)).rows.length, 0);
  assert.equal((await asUser(alice, `select payload->>'text' as text from toolkit_documents`)).rows[0].text, 'private');
  await assert.rejects(asUser(null, 'select * from toolkit_documents'), /permission denied/);
});
test('all user learning and preference tables isolate both accounts', async () => {
  for (const [table, columns, values] of [['user_actions','action_type',"'video'"],['user_preferences','adaptive_enabled','false'],['ai_interventions','intervention_type',"'hint'"]]) {
    await asUser(alice, `insert into ${table}(user_id,${columns}) values ($1,${values})`, [alice]);
    assert.equal((await asUser(bob, `select * from ${table}`)).rows.length, 0);
    await assert.rejects(asUser(bob, `insert into ${table}(user_id,${columns}) values ($1,${values})`, [alice]), /row-level security/);
  }
});
test('storage objects are private by owner prefix', async () => {
  await asUser(alice, `insert into storage.objects(bucket_id,name) values ('user-uploads',$1)`, [`${alice}/alice-project/photo.jpg`]);
  assert.equal((await asUser(bob, 'select * from storage.objects')).rows.length, 0);
  await assert.rejects(asUser(bob, `insert into storage.objects(bucket_id,name) values ('user-uploads',$1)`, [`${alice}/other.jpg`]), /row-level security/);
});
test('public pages expose only published snapshots and reject anonymous owner access', async () => {
  await asUser(alice, `insert into toolkit_sites(user_id,project_id,slug,content) values ($1,'alice-project','alice-shop','{"name":"Shop","fields":["Fecha"]}')`, [alice]);
  assert.equal((await asUser(null, `select toolkit_public_site('alice-shop') as site`)).rows[0].site, null);
  await asUser(alice, `update toolkit_sites set published=true where slug='alice-shop'`);
  const page = (await asUser(null, `select toolkit_public_site('alice-shop') as site`)).rows[0].site;
  assert.deepEqual(Object.keys(page).sort(), ['site_data', 'slug']);
  assert.equal((await asUser(bob, 'select * from toolkit_sites')).rows.length, 0);
  await assert.rejects(asUser(null, 'select * from toolkit_sites'), /permission denied/);
});
test('booking RPC fixes the owner, validates requests and records a real conversion', async () => {
  const sql = `select toolkit_submit_booking('alice-shop','Cliente de prueba','test@example.invalid','{"Fecha":"mañana"}')`;
  await asUser(null, sql);
  assert.equal((await asUser(bob, 'select * from toolkit_bookings')).rows.length, 0);
  const booking = (await asUser(alice, 'select user_id,status from toolkit_bookings')).rows[0];
  assert.equal(booking.user_id, alice); assert.equal(booking.status, 'new');
  assert.equal((await asUser(alice, `select * from toolkit_events where event_type='conversion'`)).rows.length, 1);
  await assert.rejects(asUser(null, `select toolkit_submit_booking('alice-shop','','x','{}')`), /Revisa/);
  await assert.rejects(asUser(null, `select toolkit_submit_booking('alice-shop','Cliente de prueba','test@example.invalid','{}')`), /Completa/);
  await assert.rejects(asUser(null, `select toolkit_submit_booking('missing-shop','Test Name','test@example.invalid','{}')`), /no está disponible/);
  await asUser(null, sql); await asUser(null, sql);
  await assert.rejects(asUser(null, sql), /Espera/);
});
test('event RPC permits view/click only and cannot forge a conversion', async () => {
  await asUser(null, `select toolkit_record_event('alice-shop','visit')`);
  await assert.rejects(asUser(null, `select toolkit_record_event('alice-shop','conversion')`), /inválido/);
  await assert.rejects(asUser(bob, `insert into toolkit_events(site_id,user_id,event_type) values (gen_random_uuid(),$1,'visit')`, [bob]), /permission denied/);
});
test('AI rate budget is atomic, bounded and isolated by user', async () => {
  await assert.rejects(asUser(null, 'select toolkit_take_ai_request()'), /permission denied/);
  for (let i = 0; i < 30; i++) assert.equal((await asUser(alice, 'select toolkit_take_ai_request() as allowed')).rows[0].allowed, true);
  assert.equal((await asUser(alice, 'select toolkit_take_ai_request() as allowed')).rows[0].allowed, false);
  assert.equal((await asUser(bob, 'select toolkit_take_ai_request() as allowed')).rows[0].allowed, true);
  await assert.rejects(asUser(alice, 'delete from toolkit_ai_usage'), /permission denied/);
});

const slotId = '33333333-3333-4333-8333-333333333333';
const requestId = '44444444-4444-4444-8444-444444444444';
const reserve = `select book_reservation('alice-shop',$1,'Cliente de prueba','booking@example.invalid','+51999123456',$2) as booking`;
test('availability publishes seats only and reservations isolate private customer details', async () => {
  await asUser(alice, `insert into reservation_slots(id,user_id,site_id,starts_at,ends_at) select $1,$2,id,now()+interval '1 day',now()+interval '1 day 1 hour' from toolkit_sites`, [slotId,alice]);
  const availability = (await asUser(null, `select * from public_reservation_slots('alice-shop')`)).rows;
  assert.equal(availability[0].remaining, 1);
  assert.deepEqual(Object.keys(availability[0]).sort(), ['ends_at','id','remaining','starts_at']);
  const booked = (await asUser(null, reserve, [slotId, requestId])).rows[0].booking;
  assert.equal(booked.status, 'confirmed');
  assert.deepEqual((await asUser(null, reserve, [slotId, requestId])).rows[0].booking, booked);
  assert.equal((await asUser(null, `select * from public_reservation_slots('alice-shop')`)).rows[0].remaining, 0);
  assert.equal((await asUser(bob, 'select * from reservations')).rows.length, 0);
  assert.equal((await asUser(bob, 'select * from reservation_notifications')).rows.length, 0);
  await assert.rejects(asUser(null, 'select * from reservations'), /permission denied/);
  await assert.rejects(asUser(null, reserve, [slotId, '55555555-5555-4555-8555-555555555555']), /completo/);
  await assert.rejects(asUser(alice, `update reservations set customer_email='forged@example.invalid'`), /permission denied/);
  await assert.rejects(asUser(alice, `update reservation_slots set starts_at=starts_at+interval '1 hour'`), /no puede cambiar/);
});
test('cancellation releases capacity and reactivation cannot overbook', async () => {
  await asUser(alice, `update reservations set status='cancelled' where request_id=$1`, [requestId]);
  assert.equal((await asUser(null, `select * from public_reservation_slots('alice-shop')`)).rows[0].remaining, 1);
  await asUser(null, reserve, [slotId, '55555555-5555-4555-8555-555555555555']);
  await assert.rejects(asUser(alice, `update reservations set status='confirmed' where request_id=$1`, [requestId]), /No quedan cupos/);
  assert.equal((await asUser(bob, `update reservations set status='cancelled' returning id`)).rows.length, 0);
});
test('analytics deduplicates retries, counts unique browsers and restricts ownership', async () => {
  const visitor = '66666666-6666-4666-8666-666666666666';
  const event = '77777777-7777-4777-8777-777777777777';
  const sql = `select record_site_analytics('alice-shop',$1,$2,$3,'/s/alice-shop','https://example.com')`;
  await asUser(null, sql, [event, visitor, 'page_view']);
  await asUser(null, sql, [event, visitor, 'page_view']);
  await asUser(null, sql, ['88888888-8888-4888-8888-888888888888', visitor, 'page_view']);
  await asUser(null, sql, ['99999999-9999-4999-8999-999999999999', visitor, 'cta_click']);
  const summary = (await asUser(alice, `select site_analytics_summary('alice-project') as metrics`)).rows[0].metrics;
  assert.equal(summary.unique_visitors, 1); assert.equal(summary.page_views, 2); assert.equal(summary.cta_clicks, 1);
  assert.deepEqual(summary.pages,[{path:'/s/alice-shop',views:2}]);
  assert.deepEqual(summary.sources,[{source:'https://example.com',views:2}]);
  assert.equal((await asUser(bob, `select site_analytics_summary('alice-project') as metrics`)).rows[0].metrics, null);
  assert.equal((await asUser(bob, 'select * from site_analytics')).rows.length, 0);
  await assert.rejects(asUser(null, `select site_analytics_summary('alice-project')`), /permission denied/);
  await assert.rejects(asUser(alice, `delete from site_analytics`), /permission denied/);
  await assert.rejects(asUser(null, sql, [event, visitor, 'purchase']), /inválido/);
});

test('integration results cannot be forged and provider credentials stay server-only', async () => {
  await db.exec('reset role');
  await db.query(`insert into integration_connections(user_id,provider,connected,checked_at) values($1,'calendly',true,now())`,[alice]);
  await db.query(`insert into integration_credentials(user_id,provider,access_token) values($1,'calendly','test-credential-not-real')`,[alice]);
  assert.equal((await asUser(alice,'select * from integration_connections')).rows.length,1);
  assert.equal((await asUser(bob,'select * from integration_connections')).rows.length,0);
  await assert.rejects(asUser(alice,'select * from integration_credentials'),/permission denied/);
  await assert.rejects(asUser(alice,'update integration_connections set connected=true'),/permission denied/);
  await assert.rejects(asUser(null,'select * from integration_connections'),/permission denied/);
});

test('public site images permit owner uploads but reject another tenant writing or deleting', async () => {
 await asUser(alice, `insert into storage.objects(bucket_id,name) values('site-assets',$1)`,[alice+'/alice-project/cover.jpg']);
 await assert.rejects(asUser(bob,`insert into storage.objects(bucket_id,name) values('site-assets',$1)`,[alice+'/alice-project/forged.jpg']),/row-level security/);
 assert.equal((await asUser(bob,`delete from storage.objects where bucket_id='site-assets' returning id`)).rows.length,0);
});

test('published_sites exposes actual site_data but no private owner fields or draft content',async()=>{
 const rows=(await asUser(null,`select * from published_sites where slug='alice-shop'`)).rows;
 assert.equal(rows.length,1);assert.deepEqual(Object.keys(rows[0]).sort(),['site_data','slug']);assert.equal(rows[0].site_data.name,'Shop');
 await asUser(alice,`update toolkit_sites set published=false where slug='alice-shop'`);
 assert.equal((await asUser(null,`select * from published_sites where slug='alice-shop'`)).rows.length,0);
 await assert.rejects(asUser(null,`update published_sites set site_data='{}'`),/permission denied/);
});

test('module publications isolate owners, preserve drafts and expose only a published snapshot', async () => {
  await db.exec('reset role;');
  const payload = JSON.stringify({version:1,type:'restaurant',menu:{settings:{title:'Carta'},dishes:[],sections:[]}});
  await asUser(alice, `insert into module_sites(user_id,project_id,module_type,slug,content) values ($1,'alice-project','restaurant','alice-menu',$2::jsonb)`, [alice,payload]);
  assert.equal((await asUser(null, `select module_public_site('alice-menu') as site`)).rows[0].site, null);
  assert.equal((await asUser(bob, 'select * from module_sites')).rows.length, 0);
  await assert.rejects(asUser(bob, `insert into module_sites(user_id,project_id,module_type,slug,content) values ($1,'alice-project','restaurant','forged-menu',$2::jsonb)`, [bob,payload]), /foreign key/);
  await assert.rejects(asUser(null, 'select * from module_sites'), /permission denied/);
  await asUser(alice, `update module_sites set published=true where slug='alice-menu'`);
  const published = (await asUser(null, `select module_public_site('alice-menu') as site`)).rows[0].site;
  assert.deepEqual(Object.keys(published).sort(), ['content','revision','slug']);
  assert.equal(published.content.menu.settings.title, 'Carta');
  assert.equal((await asUser(bob, `update module_sites set published=false where slug='alice-menu' returning id`)).rows.length, 0);
  await asUser(alice, `update module_sites set published=false,revision=gen_random_uuid() where slug='alice-menu'`);
  assert.equal((await asUser(null, `select module_public_site('alice-menu') as site`)).rows[0].site, null);
  assert.equal((await asUser(alice, `update module_sites set published=true where slug='alice-menu' and revision=$1 returning id`, [published.revision])).rows.length, 0);
  await assert.rejects(asUser(alice, `update module_sites set content='{}' where slug='alice-menu'`), /check constraint/);
  await assert.rejects(asUser(alice, `update module_sites set content='{"type":"courses","version":1}' where slug='alice-menu'`), /check constraint/);
});

let tourRevision, tourDocumentRevision;
const tourRequest = '33333333-3333-4333-8333-333333333333';
const tourBookingSql = `select module_reserve_tour('alice-tours','departure-1',$1,$2,$3,$4,$5) as receipt`;
test('tourism availability exposes future seats without guides or traveler information', async () => {
  await db.exec('reset role;');
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0,10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  const doc = {version:1,settings:{name:'Tours',timeZone:'UTC'},tours:[{id:'tour-1',active:true,price:999},{id:'hidden-tour',active:true,price:5}],guides:[{name:'Guía privado',contact:'private-guide@example.test'}],bookings:[],departures:[{id:'departure-1',tourId:'tour-1',date:tomorrow,time:'10:00',capacity:2},{id:'past',tourId:'tour-1',date:yesterday,time:'10:00',capacity:2},{id:'hidden',tourId:'hidden-tour',date:tomorrow,time:'10:00',capacity:3}]};
  await asUser(alice, `insert into toolkit_documents(user_id,project_id,kind,payload) values ($1,'alice-project','module-tourism',$2::jsonb)`, [alice,JSON.stringify(doc)]);
  const content = {version:1,type:'tourism',settings:{name:'Tours',timeZone:'UTC'},tours:[{id:'tour-1',active:true,price:50}]};
  const row = (await asUser(alice, `insert into module_sites(user_id,project_id,module_type,slug,content,published) values ($1,'alice-project','tourism','alice-tours',$2::jsonb,true) returning revision`, [alice,JSON.stringify(content)])).rows[0];
  tourRevision = row.revision;
  tourDocumentRevision = (await asUser(alice, `select updated_at::text as revision from toolkit_documents where kind='module-tourism'`)).rows[0].revision;
  const seats = (await asUser(null, `select module_tourism_availability('alice-tours') as departures`)).rows[0].departures;
  assert.equal(seats.length,1); assert.equal(seats[0].available,2);
  assert.deepEqual(Object.keys(seats[0]).sort(), ['available','date','id','time','tourId']);
  assert.equal(JSON.stringify(seats).includes('private-guide'),false);
});
test('public reservations use the published price, retry once and protect private admin drafts', async () => {
  const args = ['Viajera prueba','traveler@example.test',2,tourRequest,tourRevision];
  const receipt = (await asUser(null,tourBookingSql,args)).rows[0].receipt;
  assert.deepEqual(receipt,{bookingId:tourRequest,people:2,total:100,currency:'PEN'});
  assert.deepEqual((await asUser(null,tourBookingSql,args)).rows[0].receipt,receipt);
  assert.equal((await asUser(null,`select module_tourism_availability('alice-tours') as departures`)).rows[0].departures[0].available,0);
  await assert.rejects(asUser(null,tourBookingSql,['Otra viajera','other@example.test',1,'44444444-4444-4444-8444-444444444444',tourRevision]),/foru:capacity/);
  assert.equal((await asUser(alice,`update toolkit_documents set payload='{}' where kind='module-tourism' and updated_at=$1 returning project_id`,[tourDocumentRevision])).rows.length,0);
  const doc = (await asUser(alice,`select payload from toolkit_documents where kind='module-tourism'`)).rows[0].payload;
  assert.equal(doc.bookings.length,1); assert.equal(doc.bookings[0].contact,'traveler@example.test');
  assert.equal((await asUser(bob,`select * from toolkit_documents where kind='module-tourism'`)).rows.length,0);
  await assert.rejects(asUser(null,`select * from toolkit_documents where kind='module-tourism'`),/permission denied/);
});
test('cancelling frees seats, revisions cannot go backwards and invalid or duplicate requests fail', async () => {
  const previous=(await asUser(alice,`select updated_at::text as revision from toolkit_documents where kind='module-tourism'`)).rows[0].revision;
  const next=(await asUser(alice,`update toolkit_documents set payload=jsonb_set(payload,'{bookings,0,status}','"cancelled"'),updated_at='2000-01-01' where kind='module-tourism' returning updated_at::text as revision`)).rows[0].revision;
  assert.ok(new Date(next)>new Date(previous));
  assert.equal((await asUser(null,`select module_tourism_availability('alice-tours') as departures`)).rows[0].departures[0].available,2);
  await assert.rejects(asUser(null,tourBookingSql,['Viajera prueba','traveler@example.test',2,tourRequest,tourRevision]),/foru:request_conflict/);
  await assert.rejects(asUser(null,tourBookingSql,['Viajera prueba','traveler@example.test',0,'44444444-4444-4444-8444-444444444444',tourRevision]),/foru:invalid/);
  await assert.rejects(asUser(null,tourBookingSql,['Viajera prueba','traveler@example.test',1,'44444444-4444-4444-8444-444444444444','55555555-5555-4555-8555-555555555555']),/foru:stale/);
  await asUser(null,tourBookingSql,['Viajera prueba','traveler@example.test',1,'44444444-4444-4444-8444-444444444444',tourRevision]);
  await assert.rejects(asUser(null,tourBookingSql,['Viajera prueba','traveler@example.test',1,'55555555-5555-4555-8555-555555555555',tourRevision]),/foru:duplicate/);
  await asUser(alice,`update module_sites set published=false where slug='alice-tours'`);
  assert.deepEqual((await asUser(null,`select module_tourism_availability('alice-tours') as departures`)).rows[0].departures,[]);
  await assert.rejects(asUser(null,tourBookingSql,['Otra viajera','other@example.test',1,'66666666-6666-4666-8666-666666666666',tourRevision]),/foru:unavailable/);
});
