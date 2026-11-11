-- Small correction after QA: explicitly free orders never require a provider charge.
begin;
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
notify pgrst,'reload schema';
commit;
