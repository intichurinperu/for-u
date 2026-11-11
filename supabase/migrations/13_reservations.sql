-- Additive booking model. Existing booking_system and toolkit_bookings rows stay intact.
create table if not exists public.reservation_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null default 1 check (capacity between 1 and 100),
  enabled boolean not null default true,
  check (ends_at > starts_at),
  unique (site_id, starts_at),
  unique (id, site_id, user_id),
  foreign key (site_id, user_id) references public.toolkit_sites(id, user_id) on delete cascade
);
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id uuid not null,
  slot_id uuid not null,
  customer_name text not null check (length(customer_name) between 2 and 120),
  customer_email text not null check (length(customer_email) between 5 and 254),
  customer_phone text not null check (length(customer_phone) between 7 and 30),
  status text not null default 'confirmed' check (status in ('confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  foreign key (slot_id, site_id, user_id) references public.reservation_slots(id, site_id, user_id)
);
create table if not exists public.reservation_notifications (
  reservation_id uuid primary key references public.reservations(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  attempts integer not null default 0,
  sent_at timestamptz,
  last_attempt_at timestamptz,
  provider_id text
);
create index if not exists reservation_slots_site_time on public.reservation_slots(site_id, starts_at);
create index if not exists reservations_owner_time on public.reservations(user_id, created_at desc);
create index if not exists reservations_slot_status on public.reservations(slot_id,status);
create or replace function public.reservation_capacity_guard() returns trigger language plpgsql security definer set search_path = '' as $$
declare seats integer;
begin
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    select capacity into seats from public.reservation_slots where id = new.slot_id for update;
    if (select count(*) from public.reservations where slot_id = new.slot_id and id <> new.id and status <> 'cancelled') >= seats then raise exception 'No quedan cupos para reactivar esta reserva'; end if;
  end if;
  return new;
end $$;
create trigger reservation_capacity_check before update on public.reservations for each row execute function public.reservation_capacity_guard();
alter table public.reservation_slots enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_notifications enable row level security;
revoke all on public.reservation_slots, public.reservations, public.reservation_notifications from anon, authenticated;
grant select, insert, update, delete on public.reservation_slots to authenticated;
grant select on public.reservations to authenticated;
grant update(status) on public.reservations to authenticated;
grant select on public.reservation_notifications to authenticated;
create policy reservation_slots_owner on public.reservation_slots to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy reservations_owner on public.reservations to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy reservation_notifications_owner on public.reservation_notifications for select to authenticated using (exists(select 1 from public.reservations r where r.id = reservation_id and r.user_id = (select auth.uid())));

create or replace function public.public_reservation_slots(site_slug text) returns table(id uuid, starts_at timestamptz, ends_at timestamptz, remaining integer)
language sql stable security definer set search_path = '' as $$
  select slot.id, slot.starts_at, slot.ends_at, greatest(0, slot.capacity - (select count(*)::int from public.reservations r where r.slot_id = slot.id and r.status <> 'cancelled'))
  from public.reservation_slots slot join public.toolkit_sites s on s.id = slot.site_id
  where s.slug = site_slug and s.published and slot.enabled and slot.starts_at > now() and slot.starts_at < now() + interval '180 days'
  order by slot.starts_at limit 1000;
$$;
create or replace function public.book_reservation(site_slug text, slot uuid, customer text, email text, phone text, request uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare availability public.reservation_slots; reservation public.reservations; clean_email text := lower(trim(email));
begin
  if request is null or slot is null or customer is null or email is null or phone is null
    or length(trim(customer)) not between 2 and 120 or length(clean_email) > 254
    or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(trim(phone)) > 30
    or length(regexp_replace(phone,'[^0-9]','','g')) not between 7 and 15 then raise exception 'Revisa nombre, email y teléfono'; end if;
  select * into reservation from public.reservations where request_id = request;
  if found then
    if reservation.customer_email <> clean_email or reservation.slot_id <> slot then raise exception 'Solicitud inválida'; end if;
    return jsonb_build_object('id', reservation.id, 'status', reservation.status);
  end if;
  select rs.* into availability from public.reservation_slots rs join public.toolkit_sites s on s.id = rs.site_id
    where rs.id = slot and s.slug = site_slug and s.published and rs.enabled and rs.starts_at > now() and rs.starts_at < now() + interval '180 days' for update of rs;
  if not found then raise exception 'Este horario ya no está disponible'; end if;
  -- Recheck idempotency after taking the slot lock, including simultaneous retries.
  select * into reservation from public.reservations where request_id = request;
  if found then
    if reservation.customer_email <> clean_email or reservation.slot_id <> slot then raise exception 'Solicitud inválida'; end if;
    return jsonb_build_object('id', reservation.id, 'status', reservation.status);
  end if;
  if (select count(*) from public.reservations where slot_id = slot and status <> 'cancelled') >= availability.capacity then raise exception 'Este horario ya está completo'; end if;
  perform pg_advisory_xact_lock(hashtextextended('reservation:' || availability.site_id::text,0));
  if (select count(*) from public.reservations where site_id = availability.site_id and created_at > now() - interval '1 hour') >= 100 then raise exception 'La agenda recibió muchas solicitudes. Intenta más tarde'; end if;
  if (select count(*) from public.reservations where site_id = availability.site_id and customer_email = clean_email and created_at > now() - interval '1 hour') >= 3 then raise exception 'Espera antes de reservar de nuevo'; end if;
  insert into public.reservations(request_id,user_id,site_id,slot_id,customer_name,customer_email,customer_phone)
    values(request,availability.user_id,availability.site_id,slot,trim(customer),clean_email,trim(phone)) returning * into reservation;
  insert into public.reservation_notifications(reservation_id) values(reservation.id);
  return jsonb_build_object('id',reservation.id,'status',reservation.status);
end $$;
revoke all on function public.public_reservation_slots(text) from public;
revoke all on function public.book_reservation(text,uuid,text,text,text,uuid) from public;
grant execute on function public.public_reservation_slots(text) to anon, authenticated;
grant execute on function public.book_reservation(text,uuid,text,text,text,uuid) to anon, authenticated;

-- Prevent changing an appointment's time or reducing capacity beneath confirmed bookings.
create or replace function public.reservation_slot_guard() returns trigger language plpgsql security definer set search_path = '' as $$
declare booked integer;
begin
  select count(*) into booked from public.reservations where slot_id = old.id and status <> 'cancelled';
  if new.capacity < booked then raise exception 'La capacidad no puede ser menor que las reservas activas'; end if;
  if exists(select 1 from public.reservations where slot_id = old.id) and (new.starts_at <> old.starts_at or new.ends_at <> old.ends_at or new.site_id <> old.site_id or new.user_id <> old.user_id) then
    raise exception 'Un horario con reservas no puede cambiar de fecha ni de negocio';
  end if;
  return new;
end $$;
create trigger reservation_slot_check before update on public.reservation_slots for each row execute function public.reservation_slot_guard();
