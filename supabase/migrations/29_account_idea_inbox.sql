-- Account-scoped ideas: no dependency on a disposable project.
-- New table only. Never run the historical text-ID migrations for this feature.
begin;
do $$ begin
 if to_regclass('public.foru_account_documents') is null and to_regprocedure('public.foru_account_document_touch()') is not null then raise exception 'Inspect existing account touch function before applying this migration'; end if;
 if to_regclass('public.foru_account_documents') is not null and (
   (select udt_name from information_schema.columns where table_schema='public' and table_name='foru_account_documents' and column_name='user_id') is distinct from 'uuid'
   or (select udt_name from information_schema.columns where table_schema='public' and table_name='foru_account_documents' and column_name='kind') is distinct from 'text'
   or not exists(select 1 from pg_constraint where conrelid=to_regclass('public.foru_account_documents') and contype='p' and pg_get_constraintdef(oid)='PRIMARY KEY (user_id, kind)')
   or (select udt_name from information_schema.columns where table_schema='public' and table_name='foru_account_documents' and column_name='payload') is distinct from 'jsonb'
   or (select udt_name from information_schema.columns where table_schema='public' and table_name='foru_account_documents' and column_name='updated_at') is distinct from 'timestamptz'
 ) then raise exception 'Inspect existing foru_account_documents before applying this migration'; end if;
if exists(select 1 from pg_policies where schemaname='public' and tablename='foru_account_documents' and policyname<>'account_ideas_owner') then raise exception 'Inspect existing account document policies before applying this migration'; end if;
end $$;
create table if not exists public.foru_account_documents (
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind='idea-inbox'),
 payload jsonb not null default '{"version":1,"ideas":[]}'::jsonb check(jsonb_typeof(payload)='object' and pg_column_size(payload)<1048576),
 updated_at timestamptz not null default now(),
 primary key(user_id,kind)
);
alter table public.foru_account_documents enable row level security;
revoke all on public.foru_account_documents from public,anon,authenticated;
grant select,insert,update on public.foru_account_documents to authenticated;
drop policy if exists account_ideas_owner on public.foru_account_documents;
create policy account_ideas_owner on public.foru_account_documents to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create or replace function public.foru_account_document_touch() returns trigger
 language plpgsql set search_path='' as $$ begin
 new.updated_at:=greatest(clock_timestamp(),old.updated_at+interval '1 microsecond');return new;
 end $$;
revoke all on function public.foru_account_document_touch() from public,anon,authenticated;
drop trigger if exists account_document_touch on public.foru_account_documents;
create trigger account_document_touch before update on public.foru_account_documents
 for each row execute function public.foru_account_document_touch();
notify pgrst,'reload schema';
commit;
