-- Apply only after comparing diagnostics/mercado_pago_schema.sql with production.
begin;
do $$ begin
 if (select udt_name from information_schema.columns where table_schema='public' and table_name='restaurant_orders' and column_name='project_id') is distinct from 'uuid'
 or (select udt_name from information_schema.columns where table_schema='public' and table_name='toolkit_sites' and column_name='project_id') is distinct from 'uuid' then raise exception 'Compare the remote UUID schema first'; end if;
end $$;
create table if not exists public.payment_settings (
 project_id uuid primary key,user_id uuid not null,mode text not null default 'coordinated' check(mode in ('coordinated','optional','required')),
 environment text not null default 'test' check(environment in ('test','production')),revision uuid not null default gen_random_uuid(),
 foreign key(project_id,user_id) references public.projects(id,user_id)
);
create table if not exists public.payment_connections (
 id uuid primary key default gen_random_uuid(),project_id uuid not null,user_id uuid not null,
 merchant_id text not null,account_label text not null,environment text not null check(environment in ('test','production')),
 credential_cipher text not null,expires_at timestamptz not null,active boolean not null default true,
 verification_state text not null default 'authorized' check(verification_state in ('authorized','expired','error','disconnected')),
 checked_at timestamptz not null default now(),last_error text,foreign key(project_id,user_id) references public.projects(id,user_id)
);
create unique index if not exists payment_active_connection on public.payment_connections(project_id,environment) where active;
create table if not exists public.payment_oauth_sessions (
 state_hash text primary key,project_id uuid not null,user_id uuid not null,environment text not null,
 verifier_cipher text not null,expires_at timestamptz not null,consumed_at timestamptz,
 foreign key(project_id,user_id) references public.projects(id,user_id)
);
create table if not exists public.commerce_orders (
 id uuid primary key default gen_random_uuid(),project_id uuid not null,user_id uuid not null,site_id uuid not null,
 site_kind text not null check(site_kind in ('toolkit','module')),slug text not null,business text not null,
 customer_id uuid references auth.users(id),customer_name text not null,email text not null,phone text not null,
 request_id uuid unique not null,request_hash text not null,tracking_hash text not null,
 selections jsonb not null,items jsonb not null,total_cents bigint,conditions text not null default '',
 status text not null check(status in ('awaiting_quote','awaiting_acceptance','received','accepted','in_progress','completed','cancelled')),
 revision uuid not null default gen_random_uuid(),quote_revision uuid,accepted_quote uuid,quote_expires_at timestamptz,
 policy text not null default 'coordinated' check(policy in ('coordinated','optional','required')),
 history jsonb not null default '[]',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 foreign key(project_id,user_id) references public.projects(id,user_id),check(total_cents is null or total_cents>=0)
);
alter table public.restaurant_orders add column if not exists payment_policy text not null default 'coordinated' check(payment_policy in ('coordinated','optional','required'));
alter table public.restaurant_orders add column if not exists source_selections jsonb;
create table if not exists public.payment_attempts (
 id uuid primary key default gen_random_uuid(),order_kind text not null check(order_kind in ('restaurant','commerce')),order_id uuid not null,
 project_id uuid not null,user_id uuid not null,connection_id uuid not null references public.payment_connections(id),merchant_id text not null,
 environment text not null check(environment in ('test','production')),total_cents bigint not null check(total_cents>0),currency text not null default 'PEN' check(currency='PEN'),
 idempotency_key uuid unique not null default gen_random_uuid(),provider_id text unique,checkout_url text,
 provider_payload jsonb,
 state text not null default 'creating' check(state in ('creating','pending','approved','rejected','cancelled','expired','refunded','partially_refunded','charged_back','unknown')),
 active boolean not null default true,provider_updated_at timestamptz,last_checked_at timestamptz,last_error text,
 payer_email text not null,created_at timestamptz not null default now(),foreign key(project_id,user_id) references public.projects(id,user_id)
);
create unique index if not exists payment_one_active_attempt on public.payment_attempts(order_kind,order_id) where active;
create table if not exists public.payment_notifications (
 event_key text primary key,attempt_id uuid references public.payment_attempts(id),received_at timestamptz not null default now(),processed_at timestamptz
);
do $$ declare t text; begin
 foreach t in array array['payment_settings','payment_connections','payment_oauth_sessions','commerce_orders','payment_attempts','payment_notifications'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;

create or replace function public.payment_config(project uuid,value jsonb default null,expected uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public.payment_settings;
begin
 if not exists(select 1 from public.projects p where p.id=project and p.user_id=auth.uid()) then raise exception 'Proyecto no disponible' using errcode='42501'; end if;
 if value is not null then
  if coalesce(value->>'mode','') not in ('coordinated','optional','required') or coalesce(value->>'environment','') not in ('test','production') then raise exception 'Configuración inválida'; end if;
  -- Production requires a previously authorized and explicitly activated server connection.
  if value->>'mode'<>'coordinated' and not exists(select 1 from public.payment_connections c where c.project_id=project and c.user_id=auth.uid() and c.active and c.environment=value->>'environment' and c.verification_state='authorized' and c.expires_at>now()) then raise exception 'Autoriza y verifica primero la cuenta de cobro'; end if;
  if expected is null then insert into public.payment_settings(project_id,user_id,mode,environment) values(project,auth.uid(),value->>'mode',value->>'environment') on conflict do nothing returning * into s;
  else update public.payment_settings set mode=value->>'mode',environment=value->>'environment',revision=gen_random_uuid() where project_id=project and user_id=auth.uid() and revision=expected returning * into s; end if;
  if not found then raise exception 'La configuración cambió. Recupera la versión guardada' using errcode='PT409'; end if;
 end if;
 select * into s from public.payment_settings where project_id=project and user_id=auth.uid();
 return jsonb_build_object('mode',coalesce(s.mode,'coordinated'),'environment',coalesce(s.environment,'test'),'revision',s.revision,'connections',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'environment',c.environment,'accountLabel',c.account_label,'state',case when c.expires_at<=now() and c.active then 'expired' else c.verification_state end,'active',c.active,'checkedAt',c.checked_at,'error',c.last_error) order by c.checked_at desc) from public.payment_connections c where c.project_id=project and c.user_id=auth.uid()),'[]'));
end $$;

-- Public catalogue adapter uses ONLY published snapshots, not private proposal documents.
create or replace function public.commerce_catalog(site_slug text,source_kind text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare s record;offers jsonb;collection text;kind text;setting public.payment_settings;
begin
 if source_kind='toolkit' then
  select id,project_id,user_id,content into s from public.toolkit_sites where slug=site_slug and published;
  if not found then raise exception 'Página no disponible'; end if;
  offers=coalesce(s.content->'offers',(select coalesce(jsonb_agg(jsonb_build_object('id',x->>'id','name',x->>'name','price',x->'price','pricing',case when (x->>'price')::numeric=0 then 'free' else 'fixed' end,'kind','product')),'[]') from jsonb_array_elements(coalesce(s.content->'menuItems','[]')) x));
 elsif source_kind='module' then
  select id,project_id,user_id,content,module_type into s from public.module_sites where slug=site_slug and published and module_type<>'restaurant';
  if not found then raise exception 'Página no disponible'; end if;
  collection=case s.module_type when 'ecommerce' then 'products' when 'hospitality' then 'rooms' when 'tourism' then 'tours' when 'courses' then 'courses' end;
  kind=case s.module_type when 'ecommerce' then 'product' when 'hospitality' then 'stay' when 'tourism' then 'experience' when 'courses' then 'course' end;
  offers=(select coalesce(jsonb_agg(jsonb_build_object('id',s.module_type||':'||(x->>'id'),'name',x->>'name','description',coalesce(x->>'description',''),'image',coalesce(x->>'image',x->>'cover',''),'price',x->'price','pricing',case when (x->>'price')::numeric=0 then 'free' else 'fixed' end,'kind',kind,'conditions',coalesce(x->>'conditions',''))),'[]') from jsonb_array_elements(coalesce(s.content->collection,s.content->'data'->collection,'[]')) x where coalesce(x->>'available','true')<>'false' and coalesce(x->>'active','true')<>'false' and coalesce(x->>'status','')<>'maintenance');
 else raise exception 'Fuente inválida'; end if;
 select * into setting from public.payment_settings where project_id=s.project_id and user_id=s.user_id;
 -- Whitelist offer fields even if an old published JSON includes internal keys.
 offers=(select coalesce(jsonb_agg(jsonb_build_object('id',x->>'id','name',x->>'name','description',coalesce(x->>'description',''),'image',coalesce(x->>'image',''),'kind',x->>'kind','pricing',x->>'pricing','price',x->'price','conditions',coalesce(x->>'conditions',''),'variants',coalesce((select jsonb_agg(jsonb_build_object('id',v->>'id','name',v->>'name','price',v->'price','available',v->'available')) from jsonb_array_elements(coalesce(x->'variants','[]')) v),'[]'),'extras',coalesce((select jsonb_agg(jsonb_build_object('id',v->>'id','name',v->>'name','price',v->'price','available',v->'available')) from jsonb_array_elements(coalesce(x->'extras','[]')) v where v->>'available'='true'),'[]'))),'[]') from jsonb_array_elements(offers) x);
 return jsonb_build_object('offers',offers,'business',coalesce(s.content->>'name',s.content->>'title',s.content->'settings'->>'name','Negocio'),'siteId',s.id,'projectId',s.project_id,'mode',coalesce(setting.mode,'coordinated'),'environment',coalesce(setting.environment,'test'));
end $$;

create or replace function public.commerce_quote(site_slug text,source_kind text,selections jsonb) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare catalog jsonb;line jsonb;offer jsonb;variant jsonb;extra jsonb;e text;unit bigint;qty integer;total bigint=0;needs boolean=false;items jsonb='[]';
begin
 catalog=public.commerce_catalog(site_slug,source_kind);
 if jsonb_typeof(selections) is distinct from 'array' or jsonb_array_length(selections) not between 1 and 30 or pg_column_size(selections)>32000 or (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(selections) x) or (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(catalog->'offers') x) then raise exception 'Carrito o catálogo inválido'; end if;
 for line in select jsonb_array_elements(selections) loop
  if coalesce(line->>'quantity','') !~ '^[0-9]{1,2}$' or (line->>'quantity')::int not between 1 and 99 or length(coalesce(line->>'note',''))>300 or jsonb_typeof(line->'extraIds') is distinct from 'array' or jsonb_array_length(line->'extraIds')>20 then raise exception 'Cantidades u opciones inválidas'; end if;
  select x into offer from jsonb_array_elements(catalog->'offers') x where x->>'id'=line->>'offerId';
  if offer is null or length(trim(coalesce(offer->>'name',''))) not between 1 and 200 then raise exception 'Oferta no disponible'; end if;
  qty=(line->>'quantity')::int;variant=null;unit=null;
  if offer->>'pricing'='quote' then needs=true;
  elsif offer->>'pricing'='free' and offer->'price'='0'::jsonb then unit=0;
  elsif offer->>'pricing'='fixed' and jsonb_typeof(offer->'price')='number' and (offer->>'price')::numeric>0 and (offer->>'price')::numeric<=1000000 then unit=round((offer->>'price')::numeric*100)::bigint;
  else raise exception 'Precio no confirmado en la publicación'; end if;
  if jsonb_array_length(coalesce(offer->'variants','[]'))>0 or coalesce(line->>'variantId','')<>'' then
   select x into variant from jsonb_array_elements(coalesce(offer->'variants','[]')) x where x->>'id'=line->>'variantId' and x->>'available'='true';
   if variant is null or unit is null or jsonb_typeof(variant->'price') is distinct from 'number' or (variant->>'price')::numeric not between 0 and 1000000 then raise exception 'Presentación no disponible'; end if;
   unit=round((variant->>'price')::numeric*100)::bigint;
  end if;
  if (select count(*)<>count(distinct x) from jsonb_array_elements_text(line->'extraIds') x) then raise exception 'Extras repetidos'; end if;
  for e in select jsonb_array_elements_text(line->'extraIds') loop
   select x into extra from jsonb_array_elements(coalesce(offer->'extras','[]')) x where x->>'id'=e and x->>'available'='true';
   if extra is null or unit is null or jsonb_typeof(extra->'price') is distinct from 'number' or (extra->>'price')::numeric not between 0 and 1000000 then raise exception 'Extra no disponible'; end if;
   unit=unit+round((extra->>'price')::numeric*100)::bigint;
  end loop;
  if offer->>'kind' in ('stay','experience','course') then needs=true; end if;
  items=items||jsonb_build_array(jsonb_build_object('offerId',offer->>'id','name',offer->>'name','kind',offer->>'kind','description',offer->>'description','image',offer->>'image','pricing',offer->>'pricing','conditions',coalesce(offer->>'conditions',''),'quantity',qty,'variantName',variant->>'name','extraNames',(select coalesce(jsonb_agg(x->>'name'),'[]') from jsonb_array_elements(coalesce(offer->'extras','[]')) x where (line->'extraIds') ? (x->>'id')),'note',trim(coalesce(line->>'note','')),'unitCents',unit,'totalCents',unit*qty));
  total=total+coalesce(unit*qty,0);
 end loop;
 return jsonb_build_object('items',items,'totalCents',case when exists(select 1 from jsonb_array_elements(items) x where x->'unitCents'='null'::jsonb) then null else total end,'needsConfirmation',needs,'business',catalog->>'business','policy',catalog->>'mode','siteId',catalog->'siteId','projectId',catalog->'projectId');
end $$;

create or replace function public.commerce_receipt(o public.commerce_orders) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('id',o.id,'projectId',o.project_id,'business',o.business,'slug',o.slug,'sourceKind',o.site_kind,'items',o.items,'totalCents',o.total_cents,'conditions',o.conditions,'status',o.status,'revision',o.revision,'quoteRevision',o.quote_revision,'acceptedQuote',o.accepted_quote,'quoteExpiresAt',o.quote_expires_at,'policy',o.policy,'history',o.history,'createdAt',o.created_at);
$$;
create or replace function public.commerce_create(site_slug text,source_kind text,selections jsonb,customer_name text,email text,phone text,request_id uuid,tracking_token text,expected_quote jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.commerce_orders;q jsonb;fingerprint text;owner_id uuid;
begin
 if request_id is null or tracking_token is null or tracking_token !~ '^[a-f0-9]{64}$' or length(trim(coalesce(customer_name,''))) not between 1 and 100 or length(coalesce(email,''))>254 or coalesce(email,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(coalesce(phone,''))>30 then raise exception 'Datos de compra inválidos'; end if;
 fingerprint=encode(sha256(convert_to(jsonb_build_object('slug',site_slug,'kind',source_kind,'selections',selections,'name',trim(customer_name),'email',lower(email),'phone',phone,'quote',expected_quote)::text,'UTF8')),'hex');
 perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
 select * into o from public.commerce_orders r where r.request_id=commerce_create.request_id;
 if found then
  if o.request_hash<>fingerprint or o.tracking_hash<>encode(sha256(convert_to(tracking_token,'UTF8')),'hex') then raise exception 'Reintento incompatible'; end if;
  return public.commerce_receipt(o);
 end if;
 if source_kind='toolkit' then perform 1 from public.toolkit_sites where slug=site_slug for share; else perform 1 from public.module_sites where slug=site_slug for share; end if;
 q=public.commerce_quote(site_slug,source_kind,selections);
 if q is distinct from expected_quote then raise exception 'La oferta cambió. Revisa nuevamente el carrito' using errcode='PT409'; end if;
 select user_id into owner_id from public.projects where id=(q->>'projectId')::uuid;
 insert into public.commerce_orders(project_id,user_id,site_id,site_kind,slug,business,customer_id,customer_name,email,phone,request_id,request_hash,tracking_hash,selections,items,total_cents,status,policy,history)
 values((q->>'projectId')::uuid,owner_id,(q->>'siteId')::uuid,source_kind,site_slug,q->>'business',auth.uid(),trim(customer_name),lower(email),phone,request_id,fingerprint,encode(sha256(convert_to(tracking_token,'UTF8')),'hex'),selections,q->'items',(q->>'totalCents')::bigint,case when (q->>'needsConfirmation')::boolean then 'awaiting_quote' else 'received' end,q->>'policy',jsonb_build_array(jsonb_build_object('status','created','at',now()))) returning * into o;
 return public.commerce_receipt(o);
end $$;
create or replace function public.commerce_track(order_id uuid,tracking_token text,accept_revision uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.commerce_orders;
begin
 select * into o from public.commerce_orders r where r.id=order_id and (r.customer_id=auth.uid() or r.tracking_hash=encode(sha256(convert_to(tracking_token,'UTF8')),'hex')) for update;
 if not found then raise exception 'Pedido no disponible' using errcode='42501'; end if;
 if accept_revision is not null and o.accepted_quote is distinct from accept_revision then
  if o.status<>'awaiting_acceptance' or o.quote_revision<>accept_revision or o.quote_expires_at<=now() then raise exception 'La cotización cambió o venció. Consulta nuevamente' using errcode='PT409'; end if;
  update public.commerce_orders set accepted_quote=accept_revision,status='received',revision=gen_random_uuid(),updated_at=now(),history=history||jsonb_build_array(jsonb_build_object('status','quote_accepted','revision',accept_revision,'at',now())) where id=order_id returning * into o;
 end if;
 return public.commerce_receipt(o);
end $$;
create or replace function public.commerce_attempt(request uuid,tracking_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.commerce_orders;
begin
 if request is null or tracking_token is null or tracking_token !~ '^[a-f0-9]{64}$' then raise exception 'Solicitud inválida'; end if;
 perform pg_advisory_xact_lock(hashtextextended(request::text,0));
 select * into o from public.commerce_orders where request_id=request;
 if not found then return null; end if;
 if o.tracking_hash<>encode(sha256(convert_to(tracking_token,'UTF8')),'hex') then raise exception 'Pedido no disponible' using errcode='42501'; end if;
 return public.commerce_receipt(o);
end $$;
create or replace function public.commerce_manage(project uuid,order_id uuid default null,value jsonb default null,expected uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.commerce_orders;line jsonb;price jsonb;quote_items jsonb='[]';total bigint=0;quote_id uuid;
begin
 if not exists(select 1 from public.projects p where p.id=project and p.user_id=auth.uid()) then raise exception 'Proyecto no disponible' using errcode='42501'; end if;
 if order_id is null then return coalesce((select jsonb_agg(public.commerce_receipt(r)||jsonb_build_object('customerName',r.customer_name,'email',r.email,'phone',r.phone) order by r.created_at desc) from (select * from public.commerce_orders where project_id=project and user_id=auth.uid() order by created_at desc limit 200) r),'[]'); end if;
 select * into o from public.commerce_orders r where r.id=order_id and r.project_id=project and r.user_id=auth.uid() for update;
 if not found then raise exception 'Pedido no disponible' using errcode='42501'; end if;
 if value is null then return public.commerce_receipt(o); end if;
 if expected is null or expected<>o.revision then raise exception 'El pedido cambió. Recupera antes de guardar' using errcode='PT409'; end if;
 if value->>'action'='quote' then
  if o.status not in ('awaiting_quote','awaiting_acceptance','received') or exists(select 1 from public.payment_attempts a where a.order_kind='commerce' and a.order_id=o.id and (a.active or a.state in ('approved','partially_refunded'))) then raise exception 'La cotización ya está en cobro o ejecución'; end if;
  if length(trim(coalesce(value->>'conditions',''))) not between 1 and 4000 or (value->>'expiresAt')::timestamptz<=now() then raise exception 'Confirma condiciones y vencimiento'; end if;
  for line in select jsonb_array_elements(o.items) loop
   if line->>'pricing'='quote' then
    select x into price from jsonb_array_elements(value->'prices') x where x->>'offerId'=line->>'offerId';
    if price is null or coalesce(price->>'unitCents','') !~ '^[0-9]{1,9}$' or (price->>'unitCents')::bigint<=0 then raise exception 'Confirma el precio de cada oferta por cotizar'; end if;
    line=line||jsonb_build_object('unitCents',(price->>'unitCents')::bigint,'totalCents',(price->>'unitCents')::bigint*(line->>'quantity')::int);
   end if;
   total=total+(line->>'totalCents')::bigint;quote_items=quote_items||jsonb_build_array(line);
  end loop;
  quote_id=gen_random_uuid();
  update public.commerce_orders set items=quote_items,total_cents=total,conditions=value->>'conditions',quote_revision=quote_id,quote_expires_at=(value->>'expiresAt')::timestamptz,accepted_quote=null,status='awaiting_acceptance',revision=gen_random_uuid(),updated_at=now(),history=history||jsonb_build_array(jsonb_build_object('status','quote_prepared','revision',quote_id,'items',quote_items,'conditions',value->>'conditions','expiresAt',value->>'expiresAt','at',now())) where id=o.id returning * into o;
 elsif value->>'action'='status' then
  if not ((value->>'status'='cancelled' and o.status not in ('completed','cancelled')) or (o.status='received' and value->>'status'='accepted') or (o.status='accepted' and value->>'status'='in_progress') or (o.status='in_progress' and value->>'status'='completed')) then raise exception 'Transición no permitida'; end if;
  update public.commerce_orders set status=value->>'status',revision=gen_random_uuid(),updated_at=now(),history=history||jsonb_build_array(jsonb_build_object('status',value->>'status','at',now())) where id=o.id returning * into o;
 else raise exception 'Acción inválida'; end if;
 return public.commerce_receipt(o);
end $$;

-- Policies are captured on NEW orders; existing orders retain coordinated payment.
create or replace function public.payment_order_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare required boolean;
begin
 if TG_OP='INSERT' and TG_TABLE_NAME='restaurant_orders' then
  new.payment_policy=coalesce((select mode from public.payment_settings where project_id=new.project_id),'coordinated');
 elsif TG_OP='UPDATE' and new.status is distinct from old.status then
  if TG_TABLE_NAME='restaurant_orders' then required=new.payment_policy='required' and new.total_cents>0 and new.status in ('accepted','preparing','ready','out_for_delivery','completed');
  else required=new.policy='required' and new.status in ('accepted','in_progress','completed') and coalesce(new.total_cents,0)>0; end if;
  if required
  and not exists(select 1 from public.payment_attempts a where a.order_id=new.id and a.order_kind=case when TG_TABLE_NAME='restaurant_orders' then 'restaurant' else 'commerce' end and a.state='approved') then raise exception 'Confirma el pago antes de comenzar el trabajo'; end if;
 end if;
 return new;
end $$;
drop trigger if exists restaurant_payment_guard on public.restaurant_orders;
create trigger restaurant_payment_guard before insert or update on public.restaurant_orders for each row execute function public.payment_order_guard();
drop trigger if exists commerce_payment_guard on public.commerce_orders;
create trigger commerce_payment_guard before update on public.commerce_orders for each row execute function public.payment_order_guard();

-- Service-only operations: the Edge Function supplies auth.getUser identity or guest secret.
create or replace function public.payment_context(kind text,order_id uuid,actor uuid,tracking_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o record;result jsonb;
begin
 if kind='restaurant' then
  select * into o from public.restaurant_orders r where r.id=order_id and (r.customer_id=actor or r.user_id=actor or r.tracking_hash=encode(sha256(convert_to(tracking_token,'UTF8')),'hex'));
  if not found then raise exception 'Pedido no disponible' using errcode='42501'; end if;
  result=jsonb_build_object('id',o.id,'projectId',o.project_id,'ownerId',o.user_id,'totalCents',o.total_cents,'items',o.items,'status',o.status,'policy',o.payment_policy,'business',o.business,'mode',o.fulfillment->>'mode');
 elsif kind='commerce' then
  select * into o from public.commerce_orders r where r.id=order_id and (r.customer_id=actor or r.user_id=actor or r.tracking_hash=encode(sha256(convert_to(tracking_token,'UTF8')),'hex'));
  if not found then raise exception 'Pedido no disponible' using errcode='42501'; end if;
  result=jsonb_build_object('id',o.id,'projectId',o.project_id,'ownerId',o.user_id,'totalCents',o.total_cents,'items',o.items,'status',o.status,'policy',o.policy,'business',o.business);
 else raise exception 'Tipo de pedido inválido'; end if;
 return result;
end $$;
create or replace function public.payment_begin(kind text,order_id uuid,actor uuid,tracking_token text,payer_email text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare ctx jsonb;s public.payment_settings;c public.payment_connections;a public.payment_attempts;o record;q jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended(kind||order_id::text,0));
 ctx=public.payment_context(kind,order_id,actor,tracking_token);
 if length(coalesce(payer_email,''))>254 or coalesce(payer_email,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Confirma un email válido para el pago'; end if;
 select * into a from public.payment_attempts p where p.order_kind=kind and p.order_id=payment_begin.order_id and p.active;
 if found then return to_jsonb(a); end if;
 if ctx->>'policy'='coordinated' or coalesce((ctx->>'totalCents')::bigint,0)<=0 or ctx->>'status' in ('cancelled','completed','awaiting_quote','awaiting_acceptance') then raise exception 'Este pedido no está disponible para cobrar'; end if;
 if exists(select 1 from public.payment_attempts p where p.order_kind=kind and p.order_id=payment_begin.order_id and p.state in ('approved','refunded','partially_refunded','charged_back')) then raise exception 'Este pedido ya tiene un pago. Revisa su historial'; end if;
 if kind='restaurant' then
  select * into o from public.restaurant_orders where id=order_id for update;
  q=public.restaurant_order_quote(o.site_slug,o.source_selections,o.fulfillment);
  if q->'items' is distinct from o.items or (q->>'totalCents')::bigint<>o.total_cents then raise exception 'El catálogo cambió. El negocio debe revisar tu pedido antes del cobro' using errcode='PT409'; end if;
 else
  select * into o from public.commerce_orders where id=order_id for update;
  if o.quote_revision is not null then
   if o.accepted_quote is distinct from o.quote_revision or o.quote_expires_at<=now() then raise exception 'Acepta una cotización vigente antes de pagar'; end if;
  else
   q=public.commerce_quote(o.slug,o.site_kind,o.selections);
   if q->'items' is distinct from o.items or (q->>'totalCents')::bigint<>o.total_cents then raise exception 'La oferta cambió. Revisa tu compra antes de pagar' using errcode='PT409'; end if;
  end if;
 end if;
 ctx=public.payment_context(kind,order_id,actor,tracking_token);
 select * into s from public.payment_settings where project_id=(ctx->>'projectId')::uuid;
 select * into c from public.payment_connections where project_id=s.project_id and environment=s.environment and active and verification_state='authorized';
 if not found or c.expires_at<=now() or s.mode='coordinated' then raise exception 'El negocio debe renovar o activar su autorización'; end if;
 insert into public.payment_attempts(order_kind,order_id,project_id,user_id,connection_id,merchant_id,environment,total_cents,payer_email)
 values(kind,order_id,c.project_id,c.user_id,c.id,c.merchant_id,c.environment,(ctx->>'totalCents')::bigint,lower(payer_email)) returning * into a;
 return to_jsonb(a);
end $$;
create or replace function public.payment_apply(attempt uuid,provider text,checkout text,next_state text,provider_time timestamptz,error_message text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare a public.payment_attempts;
begin
 select * into a from public.payment_attempts where id=attempt for update;
 if not found then raise exception 'Intento no disponible'; end if;
 if a.provider_id is not null and provider is distinct from a.provider_id then raise exception 'Referencia incompatible'; end if;
 if next_state not in ('pending','approved','rejected','cancelled','expired','refunded','partially_refunded','charged_back','unknown') then raise exception 'Estado de pago no válido'; end if;
 if provider_time is not null and a.provider_updated_at is not null and provider_time<a.provider_updated_at then return to_jsonb(a); end if;
 if a.state in ('approved','partially_refunded','refunded','charged_back') and next_state in ('pending','unknown','rejected','cancelled','expired') then return to_jsonb(a); end if;
 update public.payment_attempts set provider_id=coalesce(provider,a.provider_id),checkout_url=coalesce(checkout,a.checkout_url),state=case when provider_time is null and a.state<>'creating' then a.state else next_state end,active=case when provider_time is null then a.active else next_state not in ('rejected','cancelled','expired') end,provider_updated_at=coalesce(provider_time,a.provider_updated_at),last_checked_at=now(),last_error=error_message where id=attempt returning * into a;
 return to_jsonb(a);
end $$;

create or replace function public.payment_oauth_claim(state_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public.payment_oauth_sessions;
begin
 update public.payment_oauth_sessions set consumed_at=now() where payment_oauth_sessions.state_hash=payment_oauth_claim.state_hash and consumed_at is null and expires_at>now() returning * into s;
 if not found then raise exception 'La autorización venció o ya se utilizó' using errcode='42501'; end if;
 if not exists(select 1 from public.projects where id=s.project_id and user_id=s.user_id) then raise exception 'Proyecto no disponible' using errcode='42501'; end if;
 return to_jsonb(s);
end $$;
create or replace function public.payment_oauth_finish(project uuid,owner uuid,environment text,merchant text,label text,cipher text,expiry timestamptz) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(project::text||environment,0));
 if not exists(select 1 from public.projects where id=project and user_id=owner) then raise exception 'Proyecto no disponible'; end if;
 update public.payment_connections set active=false,verification_state='disconnected' where project_id=project and payment_connections.environment=payment_oauth_finish.environment and active;
 insert into public.payment_connections(project_id,user_id,environment,merchant_id,account_label,credential_cipher,expires_at) values(project,owner,environment,merchant,left(label,150),cipher,expiry) returning id into result;
 return result;
end $$;
create or replace function public.payment_payload(attempt uuid,value jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 update public.payment_attempts set provider_payload=coalesce(provider_payload,value) where id=attempt returning provider_payload into result;
 if not found then raise exception 'Intento no disponible'; end if;
 return result;
end $$;

create or replace function public.restaurant_order_create(site_slug text, selections jsonb, fulfillment jsonb, customer_name text, phone text, request_id uuid, tracking_token text, expected_total bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.restaurant_orders; site public.module_sites; q jsonb; fingerprint text; token_hash text;
begin
 if pg_column_size(selections)>64000 or pg_column_size(fulfillment)>3000 then raise exception 'Pedido demasiado grande'; end if;
 if request_id is null or tracking_token is null or tracking_token !~ '^[a-f0-9]{64}$' or length(trim(coalesce(customer_name,''))) not between 1 and 100 or coalesce(phone,'') !~ '^[0-9+ ()-]{7,30}$' or expected_total is null then raise exception 'Datos de pedido inválidos'; end if;
 fingerprint=encode(sha256(convert_to(jsonb_build_object('slug',site_slug,'items',selections,'fulfillment',fulfillment,'name',trim(customer_name),'phone',phone,'total',expected_total)::text,'UTF8')),'hex');
 token_hash=encode(sha256(convert_to(tracking_token,'UTF8')),'hex');
 perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
 select * into o from public.restaurant_orders r where r.request_id=restaurant_order_create.request_id;
 if found then
  if o.request_hash<>fingerprint or o.tracking_hash<>token_hash then raise exception 'Reintento incompatible'; end if;
  return public.restaurant_order_receipt(o);
 end if;
 select * into site from public.module_sites s where s.slug=site_slug and s.published and s.module_type='restaurant' for share;
 if not found then raise exception 'Menú no disponible'; end if;
 perform 1 from public.restaurant_order_settings c where c.project_id=site.project_id for share;
 q=public.restaurant_order_quote(site_slug,selections,fulfillment);
 if (q->>'totalCents')::bigint<>expected_total then raise exception 'El catálogo o la tarifa cambió. Revisa el total antes de confirmar' using errcode='PT409'; end if;
 insert into public.restaurant_orders(project_id,user_id,site_id,business,site_slug,customer_id,request_id,request_hash,tracking_hash,customer_name,phone,fulfillment,items,subtotal_cents,delivery_cents,total_cents,history,source_selections)
 values(site.project_id,site.user_id,site.id,site.content->'menu'->'settings'->>'title',site.slug,auth.uid(),request_id,fingerprint,token_hash,trim(customer_name),phone,q->'fulfillment',q->'items',(q->>'subtotalCents')::bigint,(q->>'deliveryCents')::bigint,(q->>'totalCents')::bigint,jsonb_build_array(jsonb_build_object('status','received','at',now())),selections) returning * into o;
 return public.restaurant_order_receipt(o);
end $$;


-- Explicit privileges prevent Supabase inherited anonymous function execution.
revoke all on function public.payment_config(uuid,jsonb,uuid),public.commerce_manage(uuid,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.payment_config(uuid,jsonb,uuid),public.commerce_manage(uuid,uuid,jsonb,uuid) to authenticated;
revoke all on function public.commerce_catalog(text,text),public.commerce_quote(text,text,jsonb),public.commerce_create(text,text,jsonb,text,text,text,uuid,text,jsonb),public.commerce_track(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.commerce_catalog(text,text),public.commerce_quote(text,text,jsonb),public.commerce_create(text,text,jsonb,text,text,text,uuid,text,jsonb),public.commerce_track(uuid,text,uuid) to anon,authenticated;
revoke all on function public.commerce_attempt(uuid,text) from public,anon,authenticated;
grant execute on function public.commerce_attempt(uuid,text) to anon,authenticated;
revoke all on function public.commerce_receipt(public.commerce_orders),public.payment_order_guard(),public.payment_context(text,uuid,uuid,text),public.payment_begin(text,uuid,uuid,text,text),public.payment_apply(uuid,text,text,text,timestamptz,text) from public,anon,authenticated;
grant execute on function public.payment_context(text,uuid,uuid,text),public.payment_begin(text,uuid,uuid,text,text),public.payment_apply(uuid,text,text,text,timestamptz,text) to service_role;
revoke all on function public.payment_oauth_claim(text),public.payment_oauth_finish(uuid,uuid,text,text,text,text,timestamptz),public.payment_payload(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.payment_oauth_claim(text),public.payment_oauth_finish(uuid,uuid,text,text,text,text,timestamptz),public.payment_payload(uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
