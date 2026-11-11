-- Compared with remote diagnosis: summary implementation already aggregates both
-- UUID page types correctly. Only its inherited anonymous permission is removed.
begin;
revoke execute on function public.site_analytics_summary(text) from public, anon;
grant execute on function public.site_analytics_summary(text) to authenticated;
notify pgrst, 'reload schema';
commit;
