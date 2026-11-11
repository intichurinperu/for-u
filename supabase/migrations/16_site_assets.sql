insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('site-assets','site-assets',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy site_assets_owner_insert on storage.objects for insert to authenticated with check(bucket_id='site-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy site_assets_owner_select on storage.objects for select to authenticated using(bucket_id='site-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy site_assets_owner_delete on storage.objects for delete to authenticated using(bucket_id='site-assets' and (storage.foldername(name))[1]=auth.uid()::text);
