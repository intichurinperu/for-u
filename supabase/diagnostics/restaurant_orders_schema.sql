-- Read-only prerequisites and collision check; no customer data.
select jsonb_build_object(
 'columns',(select jsonb_agg(to_jsonb(x)) from (select table_name,column_name,udt_name,is_nullable from information_schema.columns where table_schema='public' and table_name in ('projects','module_sites','restaurant_order_settings','restaurant_orders','restaurant_customer_favorites') order by table_name,ordinal_position) x),
 'constraints',(select jsonb_agg(to_jsonb(x)) from (select c.conrelid::regclass::text as table_name,pg_get_constraintdef(c.oid) as definition from pg_constraint c where c.conrelid in (to_regclass('public.projects'),to_regclass('public.module_sites'))) x),
 'functions',(select jsonb_agg(p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'restaurant_order%')
) as diagnostic;
