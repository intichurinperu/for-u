-- Read-only metadata. Does not read credentials, customers or events.
select jsonb_build_object(
 'columns', (select coalesce(jsonb_agg(to_jsonb(x)),'[]') from (
   select table_name,column_name,udt_name,is_nullable from information_schema.columns
   where table_schema='public' and table_name in ('integration_connections','integration_credentials','site_analytics','module_site_analytics')
   order by table_name,ordinal_position) x),
 'policies', (select coalesce(jsonb_agg(to_jsonb(x)),'[]') from (
   select tablename,policyname,roles,cmd,qual,with_check from pg_policies
   where schemaname='public' and tablename in ('integration_connections','integration_credentials','site_analytics','module_site_analytics')) x),
 'functions', (select coalesce(jsonb_agg(to_jsonb(x)),'[]') from (
   select p.proname,pg_get_function_identity_arguments(p.oid) as arguments,
     has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
     has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
     pg_get_functiondef(p.oid) as definition
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname in ('record_site_analytics','record_module_analytics','site_analytics_summary')) x),
 'tables', (select coalesce(jsonb_agg(to_jsonb(x)),'[]') from (
   select c.relname,c.relrowsecurity,
     has_table_privilege('anon',c.oid,'SELECT') as anon_select,
     has_table_privilege('authenticated',c.oid,'SELECT') as authenticated_select,
     has_table_privilege('authenticated',c.oid,'INSERT') as authenticated_insert
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname in ('integration_connections','integration_credentials','site_analytics','module_site_analytics')) x)
) as diagnostic;
