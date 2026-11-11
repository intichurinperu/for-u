-- UUID-compatible toolkit repair. Review and run as one transaction after migration 20.
begin;

-- Stop safely if an older text-ID table already exists. Never cast or delete
-- existing project relations without inspecting that installation first.
do $$
declare incompatible text;
begin
  select string_agg(table_name || '.' || column_name || ' (' || data_type || ')', ', ')
    into incompatible
    from information_schema.columns
    where table_schema = 'public'
      and ((table_name = 'projects' and column_name = 'id')
        or (table_name in ('toolkit_documents', 'toolkit_sites', 'module_sites') and column_name = 'project_id'))
      and data_type <> 'uuid';
  if incompatible is not null then
    raise exception 'Inspect incompatible existing relations before repair: %. No changes applied.', incompatible;
  end if;
end $$;

-- Dependencies from 11_toolkit_ai.sql adapted for existing UUID projects.
-- Do not run the historical text-ID migrations. No provider secrets in public tables.
create unique index if not exists projects_id_user_unique on public.projects(id, user_id);

create table if not exists public.toolkit_documents (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  kind text not null check (length(kind) between 1 and 50),
  payload jsonb not null default '{}' check (pg_column_size(payload) < 1048576),
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id, kind),
  foreign key (project_id, user_id) references public.projects(id, user_id) on delete cascade
);
create table if not exists public.user_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_type text not null check (length(action_type) <= 100),
  timestamp timestamptz not null default now(),
  duration integer check (duration >= 0),
  completed boolean not null default true,
  metadata jsonb not null default '{}'
);
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  preferred_time_of_day text,
  preferred_task_duration integer,
  preferred_content_format text,
  ui_complexity_preference text,
  adaptive_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ai_interventions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intervention_type text not null,
  triggered_at timestamptz not null default now(),
  accepted boolean,
  metadata jsonb not null default '{}'
);
alter table public.user_preferences add column if not exists adaptive_enabled boolean not null default true;
create table if not exists public.toolkit_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,59}$'),
  content jsonb not null check (jsonb_typeof(content) = 'object' and pg_column_size(content) < 65536),
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, project_id),
  unique (id, user_id),
  foreign key (project_id, user_id) references public.projects(id, user_id) on delete cascade
);
create table if not exists public.toolkit_bookings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  contact text not null,
  details jsonb not null default '{}',
  status text not null default 'new' check (status in ('new','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  foreign key (site_id, user_id) references public.toolkit_sites(id, user_id) on delete cascade
);
create table if not exists public.toolkit_events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('visit','click','conversion')),
  created_at timestamptz not null default now(),
  foreign key (site_id, user_id) references public.toolkit_sites(id, user_id) on delete cascade
);
create index if not exists idx_user_actions_user_timestamp on public.user_actions(user_id, timestamp desc);
create index if not exists idx_ai_interventions_user on public.ai_interventions(user_id, triggered_at desc);
create index if not exists idx_toolkit_events_owner on public.toolkit_events(user_id, created_at desc);
create index if not exists idx_toolkit_events_site on public.toolkit_events(site_id, created_at desc);
create index if not exists idx_toolkit_bookings_site on public.toolkit_bookings(site_id, created_at desc);

do $$ declare t text; begin
  foreach t in array array['toolkit_documents','user_actions','user_preferences','ai_interventions','toolkit_sites','toolkit_bookings','toolkit_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists owner_access on public.%I', t);
    execute format('create policy owner_access on public.%I to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;
-- Events and inbound bookings are created only by the validated RPCs below.
revoke insert, update, delete on public.toolkit_events from authenticated;
revoke insert, delete on public.toolkit_bookings from authenticated;

create or replace function public.toolkit_touch() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = greatest(clock_timestamp(), old.updated_at + interval '1 microsecond'); return new; end $$;
drop trigger if exists toolkit_documents_touch on public.toolkit_documents;
create trigger toolkit_documents_touch before update on public.toolkit_documents for each row execute function public.toolkit_touch();
drop trigger if exists toolkit_preferences_touch on public.user_preferences;
create trigger toolkit_preferences_touch before update on public.user_preferences for each row execute function public.toolkit_touch();

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('user-uploads','user-uploads',false,20971520,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
drop policy if exists toolkit_upload_owner on storage.objects;
create policy toolkit_upload_owner on storage.objects for all to authenticated
using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Return only the intentional public snapshot. No owner IDs or private draft data.
create or replace function public.toolkit_public_site(site_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('slug', s.slug, 'content', s.content) from public.toolkit_sites s where s.slug = site_slug and s.published = true;
$$;
create or replace function public.toolkit_record_event(site_slug text, kind text) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.toolkit_sites;
begin
  if kind not in ('visit','click') then raise exception 'Evento inválido'; end if;
  select * into s from public.toolkit_sites where slug = site_slug and published;
  if not found then return; end if;
  perform pg_advisory_xact_lock(hashtextextended(s.id::text, 0));
  if (select count(*) from public.toolkit_events where site_id = s.id and created_at > now() - interval '1 hour') >= 5000 then return; end if;
  insert into public.toolkit_events(site_id,user_id,event_type) values(s.id,s.user_id,kind);
end $$;
create or replace function public.toolkit_submit_booking(site_slug text, customer text, contact_value text, answers jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare s public.toolkit_sites; booking_id uuid; field_name text;
begin
  if length(trim(customer)) not between 2 and 120 or length(trim(contact_value)) not between 5 and 200
    or jsonb_typeof(answers) <> 'object' or octet_length(answers::text) > 4000 then raise exception 'Revisa tus datos'; end if;
  if customer is null or contact_value is null or answers is null then raise exception 'Faltan datos'; end if;
  select * into s from public.toolkit_sites where slug = site_slug and published;
  if not found then raise exception 'Esta página no está disponible'; end if;
  if jsonb_typeof(s.content->'fields') = 'array' then
    for field_name in select jsonb_array_elements_text(s.content->'fields') loop
      if not (answers ? field_name) or jsonb_typeof(answers->field_name) <> 'string'
        or length(trim(answers->>field_name)) not between 1 and 300 then raise exception 'Completa los campos del formulario'; end if;
    end loop;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(s.id::text, 0));
  if (select count(*) from public.toolkit_bookings where site_id = s.id and created_at > now() - interval '1 hour') >= 100
    or (select count(*) from public.toolkit_bookings where site_id = s.id and contact = trim(contact_value) and created_at > now() - interval '1 hour') >= 3 then raise exception 'Espera unos minutos antes de enviar otra solicitud'; end if;
  insert into public.toolkit_bookings(site_id,user_id,customer_name,contact,details) values(s.id,s.user_id,trim(customer),trim(contact_value),answers) returning id into booking_id;
  insert into public.toolkit_events(site_id,user_id,event_type) values(s.id,s.user_id,'conversion');
  return booking_id;
end $$;
revoke all on function public.toolkit_public_site(text) from public;
revoke all on function public.toolkit_record_event(text,text) from public;
revoke all on function public.toolkit_submit_booking(text,text,text,jsonb) from public;
grant execute on function public.toolkit_public_site(text) to anon, authenticated;
grant execute on function public.toolkit_record_event(text,text) to anon, authenticated;
grant execute on function public.toolkit_submit_booking(text,text,text,jsonb) to anon, authenticated;

-- Atomic per-user budget, checked server-side before any paid AI request.
create table if not exists public.toolkit_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  requests integer not null default 1,
  primary key(user_id, window_start)
);
alter table public.toolkit_ai_usage enable row level security;
revoke all on public.toolkit_ai_usage from anon, authenticated;
create or replace function public.toolkit_take_ai_request() returns boolean
language plpgsql security definer set search_path = '' as $$
declare n integer; u uuid := auth.uid();
begin
  if u is null then return false; end if;
  insert into public.toolkit_ai_usage(user_id,window_start) values(u,date_trunc('hour',now()))
  on conflict(user_id,window_start) do update set requests = public.toolkit_ai_usage.requests + 1
  where public.toolkit_ai_usage.requests < 30 returning requests into n;
  return n is not null;
end $$;
revoke all on function public.toolkit_take_ai_request() from public;
grant execute on function public.toolkit_take_ai_request() to authenticated;


-- Dependencies from 14_site_analytics.sql adapted for existing UUID projects.
create table if not exists public.site_analytics (
  id uuid primary key,
  site_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  visitor_id uuid not null,
  event_type text not null check (event_type in ('page_view','cta_click')),
  page_path text not null,
  referrer text not null default 'direct',
  created_at timestamptz not null default now(),
  foreign key (site_id, user_id) references public.toolkit_sites(id,user_id) on delete cascade
);
alter table public.site_analytics enable row level security;
revoke all on public.site_analytics from anon, authenticated;
grant select on public.site_analytics to authenticated;
drop policy if exists site_analytics_owner on public.site_analytics;
create policy site_analytics_owner on public.site_analytics for select to authenticated using (user_id = (select auth.uid()));
create index if not exists site_analytics_owner_time on public.site_analytics(user_id,site_id,created_at desc);
create index if not exists site_analytics_visitor on public.site_analytics(site_id,visitor_id,created_at desc);
create or replace function public.record_site_analytics(site_slug text, event_id uuid, visitor uuid, kind text, path text, source text) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.toolkit_sites;
begin
  if event_id is null or visitor is null or kind not in ('page_view','cta_click')
    or path is null or path <> '/s/' || site_slug or length(path) > 300
    or source is null or length(source) > 200 or (source <> 'direct' and source !~ '^https?://[a-zA-Z0-9.-]+(:[0-9]+)?$') then raise exception 'Evento inválido'; end if;
  select * into s from public.toolkit_sites where slug=site_slug and published;
  if not found then return; end if;
  perform pg_advisory_xact_lock(hashtextextended(s.id::text || visitor::text,0));
  if (select count(*) from public.site_analytics where site_id=s.id and visitor_id=visitor and created_at > now() - interval '1 hour') >= 120 then return; end if;
  insert into public.site_analytics(id,site_id,user_id,visitor_id,event_type,page_path,referrer) values(event_id,s.id,s.user_id,visitor,kind,path,source) on conflict(id) do nothing;
end $$;
create or replace function public.site_analytics_summary(project text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare site uuid; result jsonb;
begin
  select id into site from public.toolkit_sites where project_id::text=project and user_id=auth.uid();
  if site is null then return null; end if;
  with events as (select * from public.site_analytics where site_id=site and user_id=auth.uid() and created_at > now() - interval '30 days'),
  pages as (select page_path as path,count(*) as views from events where event_type='page_view' group by page_path order by count(*) desc),
  sources as (select referrer as source,count(*) as views from events where event_type='page_view' group by referrer order by count(*) desc)
  select jsonb_build_object('unique_visitors',(select count(distinct visitor_id) from events where event_type='page_view'),'page_views',(select count(*) from events where event_type='page_view'),'cta_clicks',(select count(*) from events where event_type='cta_click'),'pages',coalesce((select jsonb_agg(pages) from pages),'[]'::jsonb),'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),'updated_at',now()) into result;
  return result;
end $$;
revoke all on function public.record_site_analytics(text,uuid,uuid,text,text,text) from public;
revoke all on function public.site_analytics_summary(text) from public;
grant execute on function public.record_site_analytics(text,uuid,uuid,text,text,text) to anon,authenticated;
grant execute on function public.site_analytics_summary(text) to authenticated;
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='site_analytics' and schemaname='public') then
    alter publication supabase_realtime add table public.site_analytics;
  end if;
end $$;


-- Dependencies from 15_integrations.sql adapted for existing UUID projects.
-- Browsers can read their verification results, never credentials or self-certify a connection.
create table if not exists public.integration_connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google_calendar','calendly','manychat','meta_ads')),
  connected boolean not null default false,
  checked_at timestamptz,
  account_label text,
  primary key(user_id,provider)
);
create table if not exists public.integration_credentials (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  access_token text not null,
  primary key(user_id,provider),
  foreign key(user_id,provider) references public.integration_connections(user_id,provider) on delete cascade
);
alter table public.integration_connections
  add column if not exists verification_state text,
  add column if not exists last_error text;
alter table public.integration_connections enable row level security;
alter table public.integration_credentials enable row level security;
revoke all on public.integration_connections,public.integration_credentials from anon,authenticated;
grant select on public.integration_connections to authenticated;
grant all on public.integration_connections,public.integration_credentials to service_role;
drop policy if exists integration_connections_owner on public.integration_connections;
create policy integration_connections_owner on public.integration_connections for select to authenticated using (user_id=(select auth.uid()));


-- Dependencies from 18_module_sites.sql adapted for existing UUID projects.
-- Public snapshots are separate from private module documents and existing landing pages.
create table if not exists public.module_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  module_type text not null check (module_type in ('restaurant','ecommerce','hospitality','tourism','courses')),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,59}$'),
  content jsonb not null check (jsonb_typeof(content) = 'object' and pg_column_size(content) < 65536),
  published boolean not null default false,
  revision uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  unique(user_id, project_id, module_type),
  foreign key(project_id, user_id) references public.projects(id, user_id) on delete cascade,
  check (coalesce(content->>'type' = module_type and content->>'version' = '1', false))
);
alter table public.module_sites enable row level security;
revoke all on public.module_sites from public, anon;
grant select, insert, update, delete on public.module_sites to authenticated;
drop policy if exists module_site_owner on public.module_sites;
create policy module_site_owner on public.module_sites for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create or replace function public.module_public_site(site_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('slug', s.slug, 'content', s.content, 'revision', s.revision)
  from public.module_sites s where s.slug = site_slug and s.published = true;
$$;
revoke all on function public.module_public_site(text) from public;
grant execute on function public.module_public_site(text) to anon, authenticated;

-- Public module pages use their own snapshot table, so keep their event FK separate.
create table if not exists public.module_site_analytics (
  id uuid primary key,
  site_id uuid not null references public.module_sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  visitor_id uuid not null,
  event_type text not null check (event_type in ('page_view','cta_click')),
  page_path text not null,
  referrer text not null default 'direct',
  created_at timestamptz not null default now()
);
alter table public.module_site_analytics enable row level security;
revoke all on public.module_site_analytics from anon, authenticated;
grant select on public.module_site_analytics to authenticated;
drop policy if exists module_analytics_owner on public.module_site_analytics;
create policy module_analytics_owner on public.module_site_analytics for select to authenticated using (user_id = (select auth.uid()));
create index if not exists module_analytics_time on public.module_site_analytics(site_id, created_at desc);

create or replace function public.record_module_analytics(site_slug text, event_id uuid, visitor uuid, kind text, path text, source text) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.module_sites;
begin
  if event_id is null or visitor is null or kind is null or kind not in ('page_view','cta_click')
    or path is null or path not in ('/' || site_slug, '/negocio/' || site_slug, '/experiencias/' || site_slug)
    or source is null or length(source) > 200
    or (source <> 'direct' and source !~ '^https?://[a-zA-Z0-9.-]+(:[0-9]+)?$') then raise exception 'Evento inválido'; end if;
  select * into s from public.module_sites where slug = site_slug and published;
  if not found then return; end if;
  perform pg_advisory_xact_lock(hashtextextended(s.id::text || visitor::text, 0));
  if (select count(*) from public.module_site_analytics where site_id=s.id and visitor_id=visitor and created_at > now() - interval '1 hour') >= 120 then return; end if;
  insert into public.module_site_analytics(id,site_id,user_id,visitor_id,event_type,page_path,referrer)
  values(event_id,s.id,s.user_id,visitor,kind,path,source) on conflict(id) do nothing;
end $$;
revoke all on function public.record_module_analytics(text,uuid,uuid,text,text,text) from public;
grant execute on function public.record_module_analytics(text,uuid,uuid,text,text,text) to anon, authenticated;

create or replace function public.site_analytics_summary(project text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if not exists(select 1 from public.projects p where p.id::text=project and p.user_id=auth.uid()) then
    raise exception 'Proyecto no disponible' using errcode = '42501';
  end if;
  with events as (
    select a.visitor_id,a.event_type,a.page_path,a.referrer,a.created_at from public.site_analytics a
      join public.toolkit_sites s on s.id=a.site_id and s.user_id=a.user_id
      where s.project_id::text=project and a.user_id=auth.uid() and a.created_at > now()-interval '30 days'
    union all
    select a.visitor_id,a.event_type,a.page_path,a.referrer,a.created_at from public.module_site_analytics a
      join public.module_sites s on s.id=a.site_id and s.user_id=a.user_id
      where s.project_id::text=project and a.user_id=auth.uid() and a.created_at > now()-interval '30 days'
  ), pages as (select page_path as path,count(*) as views from events where event_type='page_view' group by page_path order by count(*) desc),
  sources as (select referrer as source,count(*) as views from events where event_type='page_view' group by referrer order by count(*) desc),
  daily as (
    select to_char(d.day,'YYYY-MM-DD') as day,
      count(*) filter(where e.event_type='page_view') as views,
      count(*) filter(where e.event_type='cta_click') as clicks
    from generate_series(date_trunc('day',now() at time zone 'UTC') - interval '6 days', date_trunc('day',now() at time zone 'UTC'), interval '1 day') as d(day)
    left join events e on (e.created_at at time zone 'UTC')::date = d.day::date
    group by d.day order by d.day
  )
  select jsonb_build_object(
    'unique_visitors',(select count(distinct visitor_id) from events where event_type='page_view'),
    'page_views',(select count(*) from events where event_type='page_view'),
    'cta_clicks',(select count(*) from events where event_type='cta_click'),
    'pages',coalesce((select jsonb_agg(pages) from pages),'[]'::jsonb),
    'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),
    'daily',coalesce((select jsonb_agg(daily order by day) from daily),'[]'::jsonb),
    'updated_at',now()) into result;
  return result;
end $$;
revoke all on function public.site_analytics_summary(text) from public;
grant execute on function public.site_analytics_summary(text) to authenticated;
notify pgrst, 'reload schema';
commit;
