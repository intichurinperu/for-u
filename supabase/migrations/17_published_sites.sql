-- Compatibility projection: retain the existing site storage and expose only public snapshots.
-- Do not replace a published_sites relation that an existing installation already owns.
do $$ begin
  if to_regclass('public.published_sites') is null then
    execute 'create view public.published_sites as select slug, content as site_data from public.toolkit_sites where published = true';
    execute 'revoke all on public.published_sites from public, anon, authenticated';
    execute 'grant select on public.published_sites to anon, authenticated';
  end if;
end $$;
