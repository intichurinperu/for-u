-- Follow-up for installations that already applied migration 22.
-- Supabase schema default privileges may grant anon EXECUTE explicitly.
-- Ownership checks already reject anonymous requests; remove inherited access too.
begin;
revoke execute on function public.toolkit_widget_sources(uuid), public.toolkit_widget_preview(uuid,uuid,text,text,text) from anon;
notify pgrst, 'reload schema';
commit;
