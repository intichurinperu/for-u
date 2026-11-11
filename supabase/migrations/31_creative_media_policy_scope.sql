-- Scope object path explicitly: projects also has a name column.
begin;
alter policy foru_site_assets_owner_insert_v1 on storage.objects
with check(bucket_id='site-assets' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.projects p where p.id::text=(storage.foldername(storage.objects.name))[2] and p.user_id=(select auth.uid())));
alter policy foru_site_assets_owner_select_v1 on storage.objects
using(bucket_id='site-assets' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.projects p where p.id::text=(storage.foldername(storage.objects.name))[2] and p.user_id=(select auth.uid())));
notify pgrst,'reload schema';
commit;
