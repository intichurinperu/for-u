-- Read-only prerequisites and collisions. Does not read credentials or clients.
select jsonb_build_object(
 'columns',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from (select table_name,column_name,udt_name,is_nullable from information_schema.columns where table_schema='public' and table_name in ('projects','module_sites','toolkit_sites','restaurant_orders','payment_settings','payment_connections','payment_oauth_sessions','payment_attempts','payment_notifications','commerce_orders') order by table_name,ordinal_position) x),
 'constraints',(select coalesce(jsonb_agg(to_jsonb(x)),'[]') from (select c.conrelid::regclass::text as relation,c.conname,pg_get_constraintdef(c.oid) as definition from pg_constraint c where c.conrelid in ('public.projects'::regclass,'public.module_sites'::regclass,'public.toolkit_sites'::regclass,'public.restaurant_orders'::regclass)) x)
) as diagnostic;
