-- Read-only configuration. Does not read files, credentials, clients or project contents.
select jsonb_build_object(
 'buckets',(select coalesce(jsonb_agg(to_jsonb(b)),'[]') from (select id,public,file_size_limit,allowed_mime_types from storage.buckets where id in ('user-uploads','site-assets')) b),
 'policies',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from (select policyname,roles,cmd,qual,with_check from pg_policies where schemaname='storage' and tablename='objects') p)
) as creative_media_diagnostic;
