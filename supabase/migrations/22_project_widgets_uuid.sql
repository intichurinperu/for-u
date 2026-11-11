-- Delivery 4. Review remote schema first; additive UUID-only migration.
-- No historical migrations, casts, document replacement or data deletion.
begin;
do $$
begin
  if (select udt_name from information_schema.columns where table_schema='public' and table_name='projects' and column_name='id') is distinct from 'uuid'
    or (select udt_name from information_schema.columns where table_schema='public' and table_name='toolkit_sites' and column_name='project_id') is distinct from 'uuid'
    or (select udt_name from information_schema.columns where table_schema='public' and table_name='toolkit_sites' and column_name='content') is distinct from 'jsonb' then
    raise exception 'Inspect the actual UUID projects/toolkit_sites schema first. No changes applied.';
  end if;
end $$;
create table if not exists public.project_widget_grants (
  source_project uuid not null references public.projects(id) on delete cascade,
  target_project uuid not null references public.projects(id) on delete cascade,
  primary key(source_project,target_project),
  check(source_project<>target_project)
);
alter table public.project_widget_grants enable row level security;
drop policy if exists widget_grant_owner on public.project_widget_grants;
create policy widget_grant_owner on public.project_widget_grants for all to authenticated
using (exists(select 1 from public.projects p where p.id=source_project and p.user_id=(select auth.uid())))
with check (exists(select 1 from public.projects p where p.id=source_project and p.user_id=(select auth.uid())));
revoke all on public.project_widget_grants from anon;
grant select,insert,delete on public.project_widget_grants to authenticated;

-- Private helper. Every output is a whitelist from a PUBLICATION, not a draft.
create or replace function public.toolkit_widget_data(host_project uuid, source_project uuid, selection_type text, selection_id text, presentation text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare host_owner uuid; source_owner uuid; site public.toolkit_sites; item jsonb; result jsonb;
begin
  if host_project=source_project or presentation is null or selection_type is null or presentation not in ('embed','card') or selection_type not in ('offer','section') then return null; end if;
  select user_id into host_owner from public.projects where id=host_project;
  select user_id into source_owner from public.projects where id=source_project;
  if host_owner is null or source_owner is null or (host_owner<>source_owner and not exists(select 1 from public.project_widget_grants g where g.source_project=toolkit_widget_data.source_project and g.target_project=host_project)) then return null; end if;
  select * into site from public.toolkit_sites where project_id=source_project and user_id=source_owner and published;
  if not found then return null; end if;
  if selection_type='offer' then
    select value into item from jsonb_array_elements(case when jsonb_typeof(site.content->'offers')='array' then site.content->'offers' else '[]'::jsonb end) where value->>'id'=selection_id limit 1;
    if item is null then
      select jsonb_build_object('id',value->>'id','name',value->>'name','price',value->'price','pricing',case when jsonb_typeof(value->'price')='number' and (value->>'price')::numeric=0 then 'free' else 'fixed' end,'kind','product') into item from jsonb_array_elements(case when jsonb_typeof(site.content->'menuItems')='array' then site.content->'menuItems' else '[]'::jsonb end) where value->>'id'=selection_id limit 1;
    end if;
    if item is null then return null; end if;
    result=jsonb_build_object('offer',jsonb_build_object('id',left(item->>'id',80),'name',left(item->>'name',120),'description',left(coalesce(item->>'description',''),2000),'image',case when item->>'image' ~ '^https?://' and item->>'image' not like '%/storage/v1/object/sign/%' then left(item->>'image',2000) else '' end,'kind',coalesce(item->>'kind','product'),'pricing',item->>'pricing','price',item->'price','conditions',left(coalesce(item->>'conditions',''),2000),'variants',(select coalesce(jsonb_agg(jsonb_build_object('id',v->>'id','name',left(v->>'name',80),'price',v->'price','available',true)),'[]') from jsonb_array_elements(case when jsonb_typeof(item->'variants')='array' then item->'variants' else '[]'::jsonb end) v where coalesce((v->>'available')='true',true)),'extras',(select coalesce(jsonb_agg(jsonb_build_object('id',v->>'id','name',left(v->>'name',80),'price',v->'price','available',true)),'[]') from jsonb_array_elements(case when jsonb_typeof(item->'extras')='array' then item->'extras' else '[]'::jsonb end) v where coalesce((v->>'available')='true',true))));
  else
    select value into item from jsonb_array_elements(case when jsonb_typeof(site.content->'blocks')='array' then site.content->'blocks' else '[]'::jsonb end) where value->>'id'=selection_id limit 1;
    if item is null then return null; end if;
    result=jsonb_build_object('section',jsonb_build_object('title',left(item->>'title',150),'body',left(item->>'body',2000)));
  end if;
  return result||jsonb_build_object('sourceName',left(site.content->>'name',100),'slug',site.slug,'headline',left(site.content->>'headline',180),'cta',left(coalesce(site.content->>'cta','Ver proyecto'),50),'contact',case when site.content->>'whatsapp' ~ '^\d{8,15}$' then 'https://wa.me/'||(site.content->>'whatsapp') else '/s/'||site.slug end);
end $$;
revoke all on function public.toolkit_widget_data(uuid,uuid,text,text,text) from public,anon,authenticated;

create or replace function public.toolkit_widget_sources(host_project uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare owner uuid; result jsonb;
begin
 select user_id into owner from public.projects where id=host_project and user_id=auth.uid();
 if owner is null then raise exception 'Proyecto no disponible'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('projectId',s.project_id,'name',left(s.content->>'name',100),'slug',s.slug,'choices',
 (select coalesce(jsonb_agg(jsonb_build_object('type',kind,'id',v->>'id','label',left(coalesce(v->>'name',v->>'title'),150))),'[]') from (
 select 'offer' as kind,value v from jsonb_array_elements(case when jsonb_typeof(s.content->'offers')='array' then s.content->'offers' else coalesce(s.content->'menuItems','[]') end)
 union all select 'section',value from jsonb_array_elements(case when jsonb_typeof(s.content->'blocks')='array' then s.content->'blocks' else '[]'::jsonb end)) items))), '[]') into result
 from public.toolkit_sites s where s.published and s.project_id<>host_project and (s.user_id=owner or exists(select 1 from public.project_widget_grants g where g.source_project=s.project_id and g.target_project=host_project));
 return result;
end $$;
create or replace function public.toolkit_widget_preview(host_project uuid, source_project uuid, selection_type text, selection_id text, presentation text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not exists(select 1 from public.projects where id=host_project and user_id=auth.uid()) then raise exception 'Proyecto no disponible'; end if;
 return public.toolkit_widget_data(host_project,source_project,selection_type,selection_id,presentation);
end $$;
create or replace function public.toolkit_public_widgets(host_slug text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare host public.toolkit_sites; result jsonb;
begin
 select * into host from public.toolkit_sites s where s.slug=host_slug and s.published and exists(select 1 from public.projects p where p.id=s.project_id and p.user_id=s.user_id);
 if not found then return '[]'::jsonb; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',r->>'id','presentation',r->>'presentation','data',
 case when r->>'sourceProject' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then public.toolkit_widget_data(host.project_id,(r->>'sourceProject')::uuid,r->>'selectionType',r->>'selectionId',r->>'presentation') else null end)), '[]') into result
 from jsonb_array_elements(case when jsonb_typeof(host.content->'widgets')='array' then host.content->'widgets' else '[]'::jsonb end) r;
 return result;
end $$;

-- Protect REST publication writes too, not just the editor's preflight.
create or replace function public.toolkit_validate_widgets() returns trigger
language plpgsql security definer set search_path='' as $$
declare r jsonb; source uuid; has_cycle boolean;
begin
 if not new.published then return new; end if;
 perform pg_advisory_xact_lock(hashtextextended('foru-project-widgets',0));
 if new.content ? 'widgets' and (jsonb_typeof(new.content->'widgets')<>'array' or jsonb_array_length(new.content->'widgets')>8) then raise exception 'Revisa los bloques de otros proyectos'; end if;
 if jsonb_array_length(coalesce(new.content->'widgets','[]'))>0 and (auth.uid() is distinct from new.user_id or not exists(select 1 from public.projects p where p.id=new.project_id and p.user_id=new.user_id)) then raise exception 'No tienes permiso para publicar conexiones en este proyecto' using errcode='42501'; end if;
 for r in select value from jsonb_array_elements(coalesce(new.content->'widgets','[]')) loop
  if r->>'sourceProject' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or r->>'id' is null or r->>'id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or r->>'version' is distinct from '1' then raise exception 'Referencia no válida'; end if;
  source=(r->>'sourceProject')::uuid;
  if public.toolkit_widget_data(new.project_id,source,r->>'selectionType',r->>'selectionId',r->>'presentation') is null then raise exception 'La fuente no está publicada o no está autorizada'; end if;
  with recursive edges as (
    select s.project_id as host,(v->>'sourceProject')::uuid as source from public.toolkit_sites s cross join lateral jsonb_array_elements(case when jsonb_typeof(s.content->'widgets')='array' then s.content->'widgets' else '[]'::jsonb end) v
    where s.published and s.project_id<>new.project_id and v->>'sourceProject' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ), walk(node) as (select source union select e.source from edges e join walk w on w.node=e.host)
  select exists(select 1 from walk where node=new.project_id) into has_cycle;
  if has_cycle then raise exception 'Esta conexión crearía un ciclo entre proyectos'; end if;
 end loop;
 return new;
end $$;
drop trigger if exists toolkit_site_widget_check on public.toolkit_sites;
create trigger toolkit_site_widget_check before insert or update of content,published on public.toolkit_sites for each row execute function public.toolkit_validate_widgets();
revoke all on function public.toolkit_validate_widgets() from public,anon,authenticated;
revoke all on function public.toolkit_widget_sources(uuid),public.toolkit_widget_preview(uuid,uuid,text,text,text),public.toolkit_public_widgets(text) from public;
-- Supabase may grant EXECUTE to anon through schema default privileges.
revoke execute on function public.toolkit_widget_sources(uuid),public.toolkit_widget_preview(uuid,uuid,text,text,text) from anon;
grant execute on function public.toolkit_widget_sources(uuid),public.toolkit_widget_preview(uuid,uuid,text,text,text) to authenticated;
grant execute on function public.toolkit_public_widgets(text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
