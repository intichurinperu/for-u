-- Targeted repair after checking bucket configuration. Never changes projects or publications.
begin;
-- Do not replace existing bucket settings, ownership policies or limits.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('site-assets','site-assets',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
-- Fail rather than silently changing an existing private bucket into a public one.
do $$ begin
 if not exists(select 1 from storage.buckets where id='site-assets' and public=true) then
  raise exception 'site-assets exists with incompatible privacy. Review before applying.';
 end if;
end $$;
-- Images reach this bucket only on explicit publication. No draft/document reads are added.
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='foru_site_assets_owner_insert_v1') then
  create policy foru_site_assets_owner_insert_v1 on storage.objects for insert to authenticated
  with check(bucket_id='site-assets' and (storage.foldername(name))[1]=(select auth.uid())::text
    and exists(select 1 from public.projects p where p.id::text=(storage.foldername(storage.objects.name))[2] and p.user_id=(select auth.uid())));
 end if;
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='foru_site_assets_owner_select_v1') then
  create policy foru_site_assets_owner_select_v1 on storage.objects for select to authenticated
  using(bucket_id='site-assets' and (storage.foldername(name))[1]=(select auth.uid())::text
    and exists(select 1 from public.projects p where p.id::text=(storage.foldername(storage.objects.name))[2] and p.user_id=(select auth.uid())));
 end if;
end $$;
-- Audio is private, bounded by the existing size limit. Preserve all existing accepted types.
update storage.buckets set allowed_mime_types=(
 select array_agg(distinct mime order by mime) from unnest(allowed_mime_types || array['audio/mpeg','audio/mp3','audio/wav','audio/mp4','audio/webm']) mime
) where id='user-uploads' and public=false and allowed_mime_types is not null;
notify pgrst,'reload schema';
commit;
