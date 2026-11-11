-- FOR U toolkit. Apply after 01–10. No provider secrets belong in public tables.
create unique index if not exists projects_id_user_unique on public.projects(id, user_id);

create table if not exists public.toolkit_documents (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
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
  project_id text not null,
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

create or replace function public.toolkit_touch() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists toolkit_documents_touch on public.toolkit_documents;
create trigger toolkit_documents_touch before update on public.toolkit_documents for each row execute function public.toolkit_touch();
drop trigger if exists toolkit_preferences_touch on public.user_preferences;
create trigger toolkit_preferences_touch before update on public.user_preferences for each row execute function public.toolkit_touch();

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('user-uploads','user-uploads',false,20971520,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
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
