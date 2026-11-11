-- Solo lectura: ejecutar antes de preparar una reparación de reservas.
-- No cambia IDs, datos, permisos, funciones ni políticas.
select table_name, column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('projects','toolkit_sites','reservation_slots','reservations','reservation_notifications')
order by table_name, ordinal_position;

select c.relname as table_name, con.conname, pg_get_constraintdef(con.oid) as definition
from pg_constraint con join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('toolkit_sites','reservation_slots','reservations','reservation_notifications');

select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as result, p.prosecdef as security_definer,
       has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('public_reservation_slots','book_reservation','reservation_capacity_guard','reservation_slot_guard');

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public'
  and tablename in ('toolkit_sites','reservation_slots','reservations','reservation_notifications');
