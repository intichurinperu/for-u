-- Repair existing core tables: CREATE TABLE IF NOT EXISTS does not add columns.
-- Adapted to the inspected production schema: projects.id is UUID; slug is required.
-- Requires the core profiles/projects tables. All changes are transactional.
begin;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects'
      and column_name = 'id' and data_type = 'uuid'
  ) then
    raise exception 'This repair expects projects.id UUID. No changes have been applied.';
  end if;
end $$;

alter table public.profiles
  add column if not exists email text,
  add column if not exists display_name text,
  add column if not exists plan text not null default 'free',
  add column if not exists streak integer not null default 0,
  add column if not exists coins integer not null default 0;

alter table public.projects
  add column if not exists description text,
  add column if not exists tangible_goal text not null default '',
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists industry_key text,
  add column if not exists strategy_profile jsonb not null default '{}'::jsonb,
  add column if not exists template_source text;

-- Only future inserts that omit slug receive this default. Existing URLs stay intact.
alter table public.projects alter column slug set default gen_random_uuid()::text;

-- Preserve the business types already stored by the earlier app.
update public.projects
set industry_key = case when business_type = 'restaurant' then 'gastronomy' else business_type end
where industry_key is null
  and business_type in ('restaurant', 'ecommerce', 'hospitality', 'tourism', 'courses');

update public.profiles set display_name = name
where display_name is null and name is not null;

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
alter table public.toolkit_documents enable row level security;
revoke all on public.toolkit_documents from anon;
grant select, insert, update, delete on public.toolkit_documents to authenticated;
drop policy if exists owner_access on public.toolkit_documents;
create policy owner_access on public.toolkit_documents to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

notify pgrst, 'reload schema';
commit;
