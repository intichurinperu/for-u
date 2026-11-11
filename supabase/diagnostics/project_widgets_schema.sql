-- Read-only: inspect before applying 22_project_widgets_uuid.sql.
select table_name,column_name,udt_name,is_nullable from information_schema.columns
where table_schema='public' and table_name in ('projects','toolkit_sites','project_widget_grants')
order by table_name,ordinal_position;
select tablename,policyname,roles,cmd,qual,with_check from pg_policies
where schemaname='public' and tablename in ('projects','toolkit_sites','project_widget_grants');
select p.proname,pg_get_function_identity_arguments(p.oid) as arguments,p.prosecdef
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('toolkit_widget_sources','toolkit_widget_preview','toolkit_public_widgets','toolkit_validate_widgets');
