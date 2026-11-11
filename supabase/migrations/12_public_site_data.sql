-- Compatibility contract: keep the existing toolkit_sites storage and expose site_data.
-- No existing rows, columns or owner policies are removed.
create or replace function public.toolkit_public_site(site_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('slug', s.slug, 'site_data', s.content)
  from public.toolkit_sites s where s.slug = site_slug and s.published = true;
$$;
revoke all on function public.toolkit_public_site(text) from public;
grant execute on function public.toolkit_public_site(text) to anon, authenticated;
