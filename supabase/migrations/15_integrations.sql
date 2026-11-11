-- Browsers can read their verification results, never credentials or self-certify a connection.
create table public.integration_connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google_calendar','calendly','manychat','meta_ads')),
  connected boolean not null default false,
  checked_at timestamptz,
  account_label text,
  primary key(user_id,provider)
);
create table public.integration_credentials (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  access_token text not null,
  primary key(user_id,provider),
  foreign key(user_id,provider) references public.integration_connections(user_id,provider) on delete cascade
);
alter table public.integration_connections enable row level security;
alter table public.integration_credentials enable row level security;
revoke all on public.integration_connections,public.integration_credentials from anon,authenticated;
grant select on public.integration_connections to authenticated;
grant all on public.integration_connections,public.integration_credentials to service_role;
create policy integration_connections_owner on public.integration_connections for select to authenticated using (user_id=(select auth.uid()));
