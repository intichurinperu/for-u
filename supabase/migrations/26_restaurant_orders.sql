-- Additive orders, confirmed UUID projects/module_sites. Does not republish menus.
begin;
do $$ begin
 if (select udt_name from information_schema.columns where table_schema='public' and table_name='module_sites' and column_name='project_id') is distinct from 'uuid' then raise exception 'Inspect module_sites UUID schema first'; end if;
end $$;
create table if not exists public.restaurant_order_settings (
 project_id uuid primary key, user_id uuid not null, revision uuid not null default gen_random_uuid(),
 config jsonb not null, foreign key(project_id,user_id) references public.projects(id,user_id)
);
create table if not exists public.restaurant_orders (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, user_id uuid not null,
 site_id uuid not null references public.module_sites(id), business text not null default 'Restaurante', site_slug text not null default '', customer_id uuid references auth.users(id),
 request_id uuid not null unique, request_hash text not null, tracking_hash text not null,
 customer_name text not null, phone text not null, fulfillment jsonb not null, items jsonb not null,
 subtotal_cents bigint not null check(subtotal_cents>=0), delivery_cents bigint not null check(delivery_cents>=0),
 total_cents bigint not null check(total_cents=subtotal_cents+delivery_cents), currency text not null default 'PEN' check(currency='PEN'),
 status text not null default 'received' check(status in ('received','accepted','preparing','ready','out_for_delivery','completed','cancelled')),
 revision uuid not null default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 history jsonb not null default '[{"status":"received"}]', foreign key(project_id,user_id) references public.projects(id,user_id)
);
-- Compatible additive repair for records created during this delivery's QA.
alter table public.restaurant_orders add column if not exists business text not null default 'Restaurante';
alter table public.restaurant_orders add column if not exists site_slug text not null default '';
update public.restaurant_orders o set business=s.content->'menu'->'settings'->>'title',site_slug=s.slug
from public.module_sites s where o.site_id=s.id and s.published and o.site_slug='';
create index if not exists restaurant_orders_project_time on public.restaurant_orders(project_id,created_at desc);
create index if not exists restaurant_orders_customer_time on public.restaurant_orders(customer_id,created_at desc);
create table if not exists public.restaurant_customer_favorites (
 customer_id uuid not null references auth.users(id) on delete cascade,
 site_id uuid not null references public.module_sites(id), dish_id text not null,
 primary key(customer_id,site_id,dish_id)
);
alter table public.restaurant_order_settings enable row level security;
alter table public.restaurant_orders enable row level security;
alter table public.restaurant_customer_favorites enable row level security;
-- No direct writes, even by owners: validation and state transitions go through RPCs.
revoke all on public.restaurant_order_settings,public.restaurant_orders,public.restaurant_customer_favorites from public,anon,authenticated;
grant all on public.restaurant_order_settings,public.restaurant_orders,public.restaurant_customer_favorites to service_role;

create or replace function public.restaurant_order_config(project uuid, value jsonb default null, expected uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare row public.restaurant_order_settings; zone jsonb; mode text;
begin
 if not exists(select 1 from public.projects p where p.id=project and p.user_id=auth.uid()) then raise exception 'Proyecto no disponible' using errcode='42501'; end if;
 if value is null then
  select * into row from public.restaurant_order_settings where project_id=project;
  return case when found then jsonb_build_object('config',row.config,'revision',row.revision) else jsonb_build_object('config',jsonb_build_object('enabled',false,'modes','[]'::jsonb,'tables','[]'::jsonb,'zones','[]'::jsonb),'revision',null) end;
 end if;
 if jsonb_typeof(value->'enabled') is distinct from 'boolean' or jsonb_typeof(value->'modes') is distinct from 'array' or jsonb_typeof(value->'tables') is distinct from 'array' or jsonb_typeof(value->'zones') is distinct from 'array' or pg_column_size(value)>12000 then raise exception 'Configuración inválida'; end if;
 if jsonb_array_length(value->'modes')>3 or jsonb_array_length(value->'tables')>100 or jsonb_array_length(value->'zones')>30 then raise exception 'Revisa modalidades, mesas y zonas'; end if;
 for mode in select jsonb_array_elements_text(value->'modes') loop
  if mode not in ('table','pickup','delivery') then raise exception 'Modalidad inválida'; end if;
 end loop;
 for mode in select jsonb_array_elements_text(value->'tables') loop
  if length(trim(mode)) not between 1 and 60 then raise exception 'Mesa inválida'; end if;
 end loop;
 for zone in select jsonb_array_elements(value->'zones') loop
  if jsonb_typeof(zone->'id') is distinct from 'string' or length(zone->>'id') not between 1 and 60 or jsonb_typeof(zone->'name') is distinct from 'string' or length(trim(zone->>'name')) not between 1 and 100 or coalesce(zone->>'feeCents','') !~ '^[0-9]{1,9}$' or (zone->>'feeCents')::bigint>100000000 then raise exception 'Zona o tarifa inválida'; end if;
 end loop;
 if (select count(*)<>count(distinct t) from jsonb_array_elements_text(value->'tables') t) or (select count(*)<>count(distinct m) from jsonb_array_elements_text(value->'modes') m) then raise exception 'Mesas o modalidades repetidas'; end if;
 if (select count(*)<>count(distinct z->>'id') from jsonb_array_elements(value->'zones') z) then raise exception 'Zonas repetidas'; end if;
 if (value->>'enabled')::boolean and (jsonb_array_length(value->'modes')=0 or ((value->'modes') ? 'table' and jsonb_array_length(value->'tables')=0) or ((value->'modes') ? 'delivery' and jsonb_array_length(value->'zones')=0)) then raise exception 'Configura al menos una mesa o zona para cada modalidad habilitada'; end if;
 value=jsonb_build_object('enabled',value->'enabled','modes',value->'modes','tables',value->'tables','zones',(select coalesce(jsonb_agg(jsonb_build_object('id',z->>'id','name',trim(z->>'name'),'feeCents',(z->>'feeCents')::bigint)),'[]') from jsonb_array_elements(value->'zones') z));
 if expected is null then
  insert into public.restaurant_order_settings(project_id,user_id,config) values(project,auth.uid(),value) on conflict do nothing returning * into row;
 else
  update public.restaurant_order_settings set config=value,revision=gen_random_uuid() where project_id=project and user_id=auth.uid() and revision=expected returning * into row;
 end if;
 if not found then raise exception 'La configuración cambió en otra pestaña. Recupera la versión guardada' using errcode='PT409'; end if;
 return jsonb_build_object('config',row.config,'revision',row.revision);
end $$;

create or replace function public.restaurant_order_public_config(site_slug text) returns jsonb
language sql stable security definer set search_path='' as $$
 select c.config from public.module_sites s join public.restaurant_order_settings c on c.project_id=s.project_id and c.user_id=s.user_id where s.slug=site_slug and s.published and s.module_type='restaurant';
$$;

-- Canonical quote. Prices, option names and delivery fee come exclusively from server data.
create or replace function public.restaurant_order_quote(site_slug text, selections jsonb, fulfillment jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare site public.module_sites; cfg jsonb; line jsonb; dish jsonb; variant jsonb; extra jsonb; extra_id text; result jsonb='[]'; unit bigint; subtotal bigint=0; fee bigint=0; qty integer; fulfillment_public jsonb; zone jsonb;
begin
 select * into site from public.module_sites s where s.slug=site_slug and s.published and s.module_type='restaurant';
 if not found then raise exception 'Menú no disponible'; end if;
 if jsonb_typeof(site.content->'menu'->'dishes') is distinct from 'array' or (select count(*)<>count(distinct d->>'id') from jsonb_array_elements(site.content->'menu'->'dishes') d) then raise exception 'El negocio debe revisar su catálogo publicado'; end if;
 select config into cfg from public.restaurant_order_settings c where c.project_id=site.project_id and c.user_id=site.user_id;
 if cfg is null or cfg->>'enabled' is distinct from 'true' then raise exception 'El negocio no recibe pedidos internos ahora'; end if;
 if jsonb_typeof(selections) is distinct from 'array' or jsonb_array_length(selections) not between 1 and 100 or jsonb_typeof(fulfillment) is distinct from 'object' then raise exception 'Pedido inválido'; end if;
 if not coalesce((cfg->'modes') ? (fulfillment->>'mode'),false) then raise exception 'Modalidad no disponible'; end if;
 fulfillment_public=jsonb_build_object('mode',fulfillment->>'mode','note',coalesce(fulfillment->>'note',''));
 if length(coalesce(fulfillment->>'note',''))>500 then raise exception 'Nota demasiado larga'; end if;
 if fulfillment->>'mode'='table' then
  if not coalesce((cfg->'tables') ? (fulfillment->>'table'),false) then raise exception 'Mesa no disponible'; end if;
  fulfillment_public=fulfillment_public||jsonb_build_object('table',fulfillment->>'table');
 elsif fulfillment->>'mode'='delivery' then
  select z into zone from jsonb_array_elements(cfg->'zones') z where z->>'id'=fulfillment->>'zoneId';
  if zone is null or length(trim(coalesce(fulfillment->>'address',''))) not between 5 and 500 then raise exception 'Selecciona una zona y dirección de entrega válida'; end if;
  fee=(zone->>'feeCents')::bigint;
  fulfillment_public=fulfillment_public||jsonb_build_object('zoneId',zone->>'id','zoneName',zone->>'name','address',trim(fulfillment->>'address'));
 end if;
 if (select count(*)<>count(distinct l->>'id') from jsonb_array_elements(selections) l) then raise exception 'Líneas repetidas'; end if;
 for line in select jsonb_array_elements(selections) loop
  if jsonb_typeof(line) is distinct from 'object' or length(coalesce(line->>'id','')) not between 1 and 100 or coalesce(line->>'quantity','') !~ '^[0-9]{1,2}$' or (line->>'quantity')::integer not between 1 and 99 or length(coalesce(line->>'note',''))>300 or jsonb_typeof(line->'extraIds') is distinct from 'array' or jsonb_array_length(line->'extraIds')>20 then raise exception 'Cantidades, notas u opciones inválidas'; end if;
  select d into dish from jsonb_array_elements(site.content->'menu'->'dishes') d where d->>'id'=line->>'dishId';
  if dish is null or dish->'available' is distinct from 'true'::jsonb then raise exception 'Producto no disponible'; end if;
  if jsonb_typeof(dish->'name') is distinct from 'string' or length(trim(dish->>'name')) not between 1 and 200 then raise exception 'Nombre inválido en el catálogo'; end if;
  variant=null;
  if jsonb_array_length(coalesce(dish->'variants','[]'))>0 or coalesce(line->>'variantId','')<>'' then
   select v into variant from jsonb_array_elements(coalesce(dish->'variants','[]')) v where v->>'id'=line->>'variantId' and v->'available'='true'::jsonb;
   if variant is null then raise exception 'Presentación no disponible'; end if;
  end if;
  if jsonb_typeof(coalesce(variant,dish)->'price') is distinct from 'number' or coalesce((coalesce(variant,dish)->>'price')::numeric,-1) not between 0 and 1000000 then raise exception 'Precio inválido en el catálogo'; end if;
  unit=round((coalesce(variant,dish)->>'price')::numeric*100)::bigint;
  if (select count(*)<>count(distinct e) from jsonb_array_elements_text(line->'extraIds') e) then raise exception 'Extras repetidos'; end if;
  for extra_id in select jsonb_array_elements_text(line->'extraIds') loop
   select e into extra from jsonb_array_elements(coalesce(dish->'extras','[]')) e where e->>'id'=extra_id and e->'available'='true'::jsonb;
   if extra is null or jsonb_typeof(extra->'price') is distinct from 'number' or coalesce((extra->>'price')::numeric,-1) not between 0 and 1000000 then raise exception 'Extra no disponible'; end if;
   unit=unit+round((extra->>'price')::numeric*100)::bigint;
  end loop;
  qty=(line->>'quantity')::integer;
  result=result||jsonb_build_array(jsonb_build_object('dishId',dish->>'id','name',dish->>'name','variantName',variant->>'name','extraNames',(select coalesce(jsonb_agg(e->>'name'),'[]') from jsonb_array_elements(coalesce(dish->'extras','[]')) e where (line->'extraIds') ? (e->>'id')),'quantity',qty,'note',trim(coalesce(line->>'note','')),'unitCents',unit,'totalCents',unit*qty));
  subtotal=subtotal+unit*qty;
 end loop;
 return jsonb_build_object('items',result,'subtotalCents',subtotal,'deliveryCents',fee,'totalCents',subtotal+fee,'currency','PEN','fulfillment',fulfillment_public,'business',site.content->'menu'->'settings'->>'title');
end $$;

-- Deliberate public DTO excludes identity, address, phone, token hashes and request data.
create or replace function public.restaurant_order_receipt(o public.restaurant_orders) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',o.id,'status',o.status,'items',o.items,'subtotalCents',o.subtotal_cents,'deliveryCents',o.delivery_cents,'totalCents',o.total_cents,'currency',o.currency,'mode',o.fulfillment->>'mode','history',o.history,'createdAt',o.created_at,'updatedAt',o.updated_at,'revision',o.revision,'business',o.business,'slug',o.site_slug,'payment','Por coordinar con el negocio');
$$;

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
 insert into public.restaurant_orders(project_id,user_id,site_id,business,site_slug,customer_id,request_id,request_hash,tracking_hash,customer_name,phone,fulfillment,items,subtotal_cents,delivery_cents,total_cents,history)
 values(site.project_id,site.user_id,site.id,site.content->'menu'->'settings'->>'title',site.slug,auth.uid(),request_id,fingerprint,token_hash,trim(customer_name),phone,q->'fulfillment',q->'items',(q->>'subtotalCents')::bigint,(q->>'deliveryCents')::bigint,(q->>'totalCents')::bigint,jsonb_build_array(jsonb_build_object('status','received','at',now()))) returning * into o;
 return public.restaurant_order_receipt(o);
end $$;

create or replace function public.restaurant_order_track(order_id uuid, tracking_token text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare o public.restaurant_orders;
begin
 select * into o from public.restaurant_orders r where r.id=order_id and (r.customer_id=auth.uid() or (length(tracking_token)=64 and r.tracking_hash=encode(sha256(convert_to(tracking_token,'UTF8')),'hex')));
 if not found then raise exception 'Pedido no disponible' using errcode='42501'; end if;
 return public.restaurant_order_receipt(o);
end $$;

create or replace function public.restaurant_order_manage(project uuid, order_id uuid default null, next_status text default null, expected uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.restaurant_orders; allowed text[];
begin
 if not exists(select 1 from public.projects p where p.id=project and p.user_id=auth.uid()) then raise exception 'Proyecto no disponible' using errcode='42501'; end if;
 if order_id is null then
  return coalesce((select jsonb_agg(public.restaurant_order_receipt(r)||jsonb_build_object('customerName',r.customer_name,'phone',r.phone,'fulfillment',r.fulfillment) order by r.created_at desc) from (select * from public.restaurant_orders where project_id=project and user_id=auth.uid() order by created_at desc limit 200) r),'[]');
 end if;
 select * into o from public.restaurant_orders r where r.id=order_id and r.project_id=project and r.user_id=auth.uid() for update;
 if not found then raise exception 'Pedido no disponible' using errcode='42501'; end if;
 if next_status is null then return public.restaurant_order_receipt(o)||jsonb_build_object('customerName',o.customer_name,'phone',o.phone,'fulfillment',o.fulfillment); end if;
 if expected is null or expected<>o.revision then raise exception 'El pedido cambió. Actualiza antes de reintentar' using errcode='PT409'; end if;
 allowed=case o.status when 'received' then array['accepted','cancelled'] when 'accepted' then array['preparing','cancelled'] when 'preparing' then array['ready','cancelled'] when 'ready' then case when o.fulfillment->>'mode'='delivery' then array['out_for_delivery','cancelled'] else array['completed','cancelled'] end when 'out_for_delivery' then array['completed','cancelled'] else array[]::text[] end;
 if not next_status=any(allowed) then raise exception 'Transición de estado no permitida'; end if;
 update public.restaurant_orders set status=next_status,revision=gen_random_uuid(),updated_at=now(),history=history||jsonb_build_array(jsonb_build_object('status',next_status,'at',now())) where id=order_id returning * into o;
 return public.restaurant_order_receipt(o)||jsonb_build_object('customerName',o.customer_name,'phone',o.phone,'fulfillment',o.fulfillment);
end $$;

create or replace function public.restaurant_order_customer(site_slug text, favorite_dish text default null, favorite boolean default null, claim_order uuid default null, tracking_token text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare site public.module_sites;
begin
 if auth.uid() is null then raise exception 'Inicia sesión para usar tu perfil' using errcode='42501'; end if;
 select * into site from public.module_sites s where s.slug=site_slug and s.module_type='restaurant';
 if not found then raise exception 'Negocio no disponible'; end if;
 if claim_order is not null then
  update public.restaurant_orders r set customer_id=auth.uid() where r.id=claim_order and r.site_id=site.id and r.customer_id is null and length(tracking_token)=64 and r.tracking_hash=encode(sha256(convert_to(tracking_token,'UTF8')),'hex');
  if not found and not exists(select 1 from public.restaurant_orders where id=claim_order and site_id=site.id and customer_id=auth.uid()) then raise exception 'No puedes asociar ese pedido' using errcode='42501'; end if;
 end if;
 if favorite_dish is not null and favorite is not null then
  if favorite then
   if not site.published or not exists(select 1 from jsonb_array_elements(site.content->'menu'->'dishes') d where d->>'id'=favorite_dish and d->>'available'='true') then raise exception 'Producto no disponible'; end if;
   insert into public.restaurant_customer_favorites values(auth.uid(),site.id,favorite_dish) on conflict do nothing;
  else delete from public.restaurant_customer_favorites where customer_id=auth.uid() and site_id=site.id and dish_id=favorite_dish; end if;
 end if;
 return jsonb_build_object('favorites',coalesce((select jsonb_agg(dish_id) from public.restaurant_customer_favorites where customer_id=auth.uid() and site_id=site.id),'[]'),'orders',coalesce((select jsonb_agg(public.restaurant_order_receipt(r) order by created_at desc) from (select * from public.restaurant_orders where customer_id=auth.uid() and site_id=site.id order by created_at desc limit 100) r),'[]'));
end $$;
-- Recovery of uncertain result locks the same request key as checkout.
create or replace function public.restaurant_order_attempt(request uuid, tracking_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.restaurant_orders;
begin
 if request is null or tracking_token is null or tracking_token !~ '^[a-f0-9]{64}$' then raise exception 'Solicitud inválida'; end if;
 perform pg_advisory_xact_lock(hashtextextended(request::text,0));
 select * into o from public.restaurant_orders where request_id=request;
 if not found then return null; end if;
 if o.tracking_hash<>encode(sha256(convert_to(tracking_token,'UTF8')),'hex') then raise exception 'Pedido no disponible' using errcode='42501'; end if;
 return public.restaurant_order_receipt(o);
end $$;
revoke all on function public.restaurant_order_attempt(uuid,text) from public,anon,authenticated;
grant execute on function public.restaurant_order_attempt(uuid,text) to anon,authenticated;
revoke all on function public.restaurant_order_receipt(public.restaurant_orders) from public,anon,authenticated;
revoke all on function public.restaurant_order_config(uuid,jsonb,uuid),public.restaurant_order_manage(uuid,uuid,text,uuid),public.restaurant_order_customer(text,text,boolean,uuid,text) from public,anon,authenticated;
grant execute on function public.restaurant_order_config(uuid,jsonb,uuid),public.restaurant_order_manage(uuid,uuid,text,uuid),public.restaurant_order_customer(text,text,boolean,uuid,text) to authenticated;
revoke all on function public.restaurant_order_public_config(text),public.restaurant_order_quote(text,jsonb,jsonb),public.restaurant_order_create(text,jsonb,jsonb,text,text,uuid,text,bigint),public.restaurant_order_track(uuid,text) from public,anon,authenticated;
grant execute on function public.restaurant_order_public_config(text),public.restaurant_order_quote(text,jsonb,jsonb),public.restaurant_order_create(text,jsonb,jsonb,text,text,uuid,text,bigint),public.restaurant_order_track(uuid,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
