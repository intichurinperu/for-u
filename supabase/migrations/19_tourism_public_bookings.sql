-- Availability is read from the private operational document; contacts never leave it.
-- Client clocks cannot reuse an old revision and defeat optimistic locking.
create or replace function public.toolkit_document_revision() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := greatest(clock_timestamp(), old.updated_at + interval '1 microsecond');
  return new;
end $$;
revoke all on function public.toolkit_document_revision() from public;
create trigger toolkit_document_revision before update on public.toolkit_documents
for each row execute function public.toolkit_document_revision();

create or replace function public.module_tourism_availability(site_slug text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare s public.module_sites; doc jsonb; zone text; result jsonb;
begin
  select * into s from public.module_sites where slug=site_slug and published and module_type='tourism';
  if not found then return '[]'::jsonb; end if;
  select payload into doc from public.toolkit_documents where user_id=s.user_id and project_id=s.project_id and kind='module-tourism';
  if not found then return '[]'::jsonb; end if;
  zone := coalesce(s.content#>>'{settings,timeZone}', 'America/Lima');
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', d->>'id', 'tourId', d->>'tourId', 'date', d->>'date', 'time', d->>'time',
    'available', greatest(0, (d->>'capacity')::integer - coalesce((select sum((b->>'people')::integer) from jsonb_array_elements(doc->'bookings') b where b->>'departureId'=d->>'id' and b->>'status'='confirmed'),0))
  ) order by d->>'date', d->>'time'), '[]'::jsonb) into result
  from jsonb_array_elements(doc->'departures') d
  where exists(select 1 from jsonb_array_elements(s.content->'tours') t where t->>'id'=d->>'tourId' and t->>'active'='true')
    and exists(select 1 from jsonb_array_elements(doc->'tours') t where t->>'id'=d->>'tourId' and t->>'active'='true')
    and (((d->>'date')::date + (d->>'time')::time) at time zone zone) > now();
  return result;
end $$;

create or replace function public.module_reserve_tour(
  site_slug text, departure_id text, customer_name text, customer_contact text,
  party_size integer, booking_request uuid, site_revision uuid
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.module_sites; doc public.toolkit_documents; departure jsonb; tour jsonb; old_booking jsonb;
  reserved integer; capacity integer; total numeric; zone text; starts_at timestamptz; new_booking jsonb;
begin
  if booking_request is null or departure_id is null or length(departure_id) not between 1 and 120 or party_size is null or party_size < 1
    or customer_name is null or length(trim(customer_name)) not between 2 and 100
    or customer_contact is null or length(trim(customer_contact)) not between 3 and 200 then
    raise exception 'foru:invalid';
  end if;
  -- Lock publication first so withdrawal and booking have a consistent order.
  select * into s from public.module_sites where slug=site_slug and published and module_type='tourism' for share;
  if not found then raise exception 'foru:unavailable'; end if;
  select * into doc from public.toolkit_documents where user_id=s.user_id and project_id=s.project_id and kind='module-tourism' for update;
  if not found then raise exception 'foru:unavailable'; end if;
  select b into old_booking from jsonb_array_elements(doc.payload->'bookings') b where b->>'id'=booking_request::text;
  if found then
    if old_booking->>'departureId' <> departure_id or old_booking->>'customer' <> trim(customer_name)
      or old_booking->>'contact' <> trim(customer_contact) or (old_booking->>'people')::integer <> party_size
      or old_booking->>'status' <> 'confirmed' then raise exception 'foru:request_conflict'; end if;
    return jsonb_build_object('bookingId',booking_request,'people',party_size,'total',old_booking->'total','currency','PEN');
  end if;
  if site_revision is null or site_revision <> s.revision then raise exception 'foru:stale'; end if;
  select d into departure from jsonb_array_elements(doc.payload->'departures') d where d->>'id'=departure_id;
  if not found then raise exception 'foru:unavailable'; end if;
  select t into tour from jsonb_array_elements(s.content->'tours') t where t->>'id'=departure->>'tourId' and t->>'active'='true';
  if not found or not exists(select 1 from jsonb_array_elements(doc.payload->'tours') t where t->>'id'=departure->>'tourId' and t->>'active'='true') then raise exception 'foru:unavailable'; end if;
  zone := coalesce(s.content#>>'{settings,timeZone}', 'America/Lima');
  starts_at := (((departure->>'date')::date + (departure->>'time')::time) at time zone zone);
  if starts_at <= now() then raise exception 'foru:unavailable'; end if;
  capacity := (departure->>'capacity')::integer;
  select coalesce(sum((b->>'people')::integer),0) into reserved from jsonb_array_elements(doc.payload->'bookings') b where b->>'departureId'=departure_id and b->>'status'='confirmed';
  if reserved + party_size > capacity then raise exception 'foru:capacity'; end if;
  if exists(select 1 from jsonb_array_elements(doc.payload->'bookings') b where b->>'departureId'=departure_id and b->>'status'='confirmed' and lower(trim(b->>'contact'))=lower(trim(customer_contact))) then raise exception 'foru:duplicate'; end if;
  if jsonb_typeof(tour->'price') <> 'number' or (tour->>'price')::numeric < 0 then raise exception 'foru:unavailable'; end if;
  total := round((tour->>'price')::numeric, 2) * party_size;
  new_booking := jsonb_build_object('id', booking_request, 'departureId', departure_id, 'customer', trim(customer_name), 'contact', trim(customer_contact), 'people', party_size, 'total', total, 'status', 'confirmed');
  update public.toolkit_documents set payload=jsonb_set(doc.payload, '{bookings}', coalesce(doc.payload->'bookings','[]'::jsonb) || jsonb_build_array(new_booking)),
    updated_at=greatest(clock_timestamp(),doc.updated_at + interval '1 microsecond')
  where user_id=s.user_id and project_id=s.project_id and kind='module-tourism';
  return jsonb_build_object('bookingId',booking_request,'people',party_size,'total',total,'currency','PEN');
end $$;
revoke all on function public.module_tourism_availability(text) from public;
revoke all on function public.module_reserve_tour(text,text,text,text,integer,uuid,uuid) from public;
grant execute on function public.module_tourism_availability(text) to anon, authenticated;
grant execute on function public.module_reserve_tour(text,text,text,text,integer,uuid,uuid) to anon, authenticated;
