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
  select id into site from public.toolkit_sites where project_id=project and user_id=auth.uid();
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
