-- Public snapshots are separate from private module documents and existing landing pages.
create table if not exists public.module_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
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
create policy module_site_owner on public.module_sites for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create or replace function public.module_public_site(site_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('slug', s.slug, 'content', s.content, 'revision', s.revision)
  from public.module_sites s where s.slug = site_slug and s.published = true;
$$;
revoke all on function public.module_public_site(text) from public;
grant execute on function public.module_public_site(text) to anon, authenticated;
