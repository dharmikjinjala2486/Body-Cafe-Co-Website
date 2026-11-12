-- 12 Nov 2026: Shipneer courier booking for the hosted API (supabase/functions/operations/shipping.js).
-- The function talks to Shipneer; these routines make each change to an order one locked transaction, so two clicks
-- can't book twice: book_begin leaves a short claim on the order, and only book_done (or book_fail) clears it.
-- Stock: on the hosted store units leave "available" when the order is reserved, so booking moves nothing; a parcel
-- the courier brings back is put on the shelf again by restock.
begin;
create table if not exists public.bcc_delivery_cache(pincode text primary key,data jsonb not null,expires bigint not null);
alter table public.bcc_delivery_cache enable row level security;
revoke all on public.bcc_delivery_cache from anon,authenticated;
grant all on public.bcc_delivery_cache to service_role;

-- One pincode check against a visitor's hourly allowance (kept in bcc_chat_usage under its own scope, which that
-- table's own clean-up already prunes). Returns the cached answer if there is one, else whether a check is allowed.
create or replace function public.bcc_delivery_hit(p_key text,p_pincode text,p_limit integer) returns jsonb language plpgsql set search_path=public as $$
declare now_s bigint=extract(epoch from now())::bigint; n integer; hit jsonb;
begin
 if p_key is null or length(p_key)<8 or length(p_key)>100 or p_pincode !~ '^[1-9][0-9]{5}$' then raise exception 'Invalid delivery check'; end if;
 select data into hit from bcc_delivery_cache where pincode=p_pincode and expires>now_s;
 if found then return jsonb_build_object('ok',true,'cached',hit); end if;
 insert into bcc_chat_usage values('d:'||p_key,now_s/3600,1) on conflict(scope,bucket) do update set count=bcc_chat_usage.count+1 returning count into n;
 if n>p_limit then return jsonb_build_object('ok',false); end if;
 return jsonb_build_object('ok',true);
end $$;
create or replace function public.bcc_delivery_save(p_pincode text,p_data jsonb,p_ttl integer) returns void language plpgsql set search_path=public as $$
declare now_s bigint=extract(epoch from now())::bigint;
begin
 if p_pincode !~ '^[1-9][0-9]{5}$' then raise exception 'Invalid delivery check'; end if;
 insert into bcc_delivery_cache values(p_pincode,p_data,now_s+p_ttl) on conflict(pincode) do update set data=excluded.data,expires=excluded.expires;
 delete from bcc_delivery_cache where expires<now_s-86400;
end $$;

create or replace function public.bcc_ship_action(p_actor text,p_action text,p_id text,p_data jsonb default '{}') returns jsonb language plpgsql set search_path=public as $$
declare o bcc_orders; sn jsonb; d jsonb; now_s bigint=extract(epoch from now())::bigint; n bigint; reason text=trim(coalesce(p_data->>'remarks','')); courier jsonb; new_state text; at_s bigint;
begin
 if p_action='due' then
  return coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'ordref',x.ordref)) from (select id,data->'shipneer'->>'ordref' ordref from bcc_orders
   where state='shipped' and data->'shipneer'->>'ordref' is not null and now_s-coalesce((data->'shipneer'->>'tracking_checked')::bigint,0)>=coalesce((p_data->>'every')::integer,3600)
   order by coalesce((data->'shipneer'->>'tracking_checked')::bigint,0) limit least(coalesce((p_data->>'limit')::integer,5),20)) x),'[]'::jsonb);
 end if;
 select * into o from bcc_orders where id=p_id for update;
 if not found then raise exception 'Order not found'; end if;
 d=o.data; sn=coalesce(d->'shipneer','{}'::jsonb); new_state=o.state;

 if p_action in ('quote_begin','book_begin') then
  if o.state not in ('paid','packing') then raise exception 'Only paid or packing orders can be booked.'; end if;
  if sn->>'ordref' is not null then raise exception 'This order is already booked with Shipneer. Cancel that booking first.'; end if;
  if exists(select 1 from bcc_reservations r join bcc_batches b on b.id=r.batch where r.order_id=p_id and r.state='consumed' and (b.expiry<=now_s or b.state!='released' or not b.proof)) then
   raise exception 'Resolve quarantined, expired or unreleased batches before shipping.'; end if;
 end if;

 if p_action='quote_begin' then
  -- Shipneer accepts only a numeric order_id, and each number only once, so every price request gets a fresh one.
  perform 1 from bcc_settings where id='shipneer_seq' for update;
  n=greatest(coalesce((select (data#>>'{}')::bigint from bcc_settings where id='shipneer_seq'),10000)+1,((now_s-1767225600)*10)::bigint);
  insert into bcc_settings values('shipneer_seq',to_jsonb(n)) on conflict(id) do update set data=excluded.data;
  return jsonb_build_object('ship_id',n,'order',d,'created',o.created);
 elsif p_action='quote_save' then
  if sn->>'ordref' is not null then raise exception 'This order is already booked with Shipneer. Cancel that booking first.'; end if;
  sn=sn||jsonb_build_object('ship_id',p_data->'ship_id','parcel',p_data->'parcel','couriers',p_data->'couriers','chargeable_weight',p_data->'chargeable_weight','quoted',now_s);
 elsif p_action='book_begin' then
  select x into courier from jsonb_array_elements(coalesce(sn->'couriers','[]'::jsonb)) x where x->>'code'=p_data->>'code' limit 1;
  if courier is null then raise exception 'Choose a courier from the list.'; end if;
  if now_s-coalesce((sn->>'quoted')::bigint,0)>21600 then raise exception 'These prices are over six hours old. Get courier prices again.'; end if;
  if now_s-coalesce((sn->>'booking')::bigint,0)<120 then raise exception 'A booking for this order is already in progress. Wait a moment and refresh.'; end if;
  sn=sn||jsonb_build_object('booking',now_s);
  update bcc_orders set data=d||jsonb_build_object('shipneer',sn) where id=p_id;
  return jsonb_build_object('ship_id',sn->'ship_id','courier',courier);
 elsif p_action='book_fail' then
  sn=sn-'booking';
 elsif p_action='book_done' then
  if length(coalesce(p_data->>'ordref',''))<1 then raise exception 'Booking reference missing'; end if;
  sn=(sn-'couriers'-'booking')||jsonb_build_object('ordref',p_data->>'ordref','awb',p_data->>'awb','courier',p_data->>'courier','charge',p_data->'charge','rate',p_data->'rate','booked',now_s,'booked_by',p_actor);
  d=d||jsonb_build_object('provider',p_data->>'courier','tracking',p_data->>'awb','tracking_status','Booked','tracking_events','[]'::jsonb,
   'history',coalesce(d->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object('state','shipped','at',now_s,'note','Packed and booked with '||(p_data->>'courier')||'. Tracking number '||(p_data->>'awb')||'.')),
   'internal_notes',coalesce(d->'internal_notes','[]'::jsonb)||jsonb_build_array(jsonb_build_object('text','Shipneer booking '||(p_data->>'ordref')||' · '||(p_data->>'courier')||' · ₹'||coalesce(p_data->>'charge','?'),'at',now_s,'actor',p_actor)));
  new_state='shipped';
 elsif p_action='track' then
  -- The hourly check passes the booking it asked about; a booking changed meanwhile is left alone.
  if sn->>'ordref' is null then raise exception 'This order has no Shipneer booking.'; end if;
  if sn->>'ordref' is distinct from p_data->>'ordref' then return jsonb_build_object('ok',true,'skipped',true); end if;
  sn=sn||jsonb_build_object('tracking_checked',now_s);
  d=d||jsonb_build_object('tracking_status',coalesce(nullif(p_data->>'status',''),d->>'tracking_status'),'tracking_events',coalesce(p_data->'events','[]'::jsonb));
  if p_data->>'outcome'='delivered' and o.state='shipped' and sn->>'returned' is null then
   new_state='delivered'; at_s=coalesce((p_data->>'delivered_at')::bigint,now_s);
   d=d||jsonb_build_object('history',coalesce(d->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object('state','delivered','at',at_s)));
  elsif p_data->>'outcome'='returned' and sn->>'returned' is null then
   sn=sn||jsonb_build_object('returned',now_s);
   d=d||jsonb_build_object('internal_notes',coalesce(d->'internal_notes','[]'::jsonb)||jsonb_build_array(jsonb_build_object('text','Courier reports a return to origin ('||coalesce(p_data->>'status','')||'). When the parcel arrives, use Restock returned parcel.','at',now_s,'actor','shipneer')));
  end if;
 elsif p_action in ('cancel_begin','cancel_done') then
  if sn->>'ordref' is null then raise exception 'This order has no Shipneer booking.'; end if;
  if o.state!='shipped' then raise exception 'Only a booked, undelivered shipment can be cancelled.'; end if;
  if length(reason)<5 then raise exception 'Add a remark for cancelling this booking.'; end if;
  if p_action='cancel_begin' then return jsonb_build_object('ordref',sn->>'ordref'); end if;
  if sn->>'ordref' is distinct from p_data->>'ordref' then raise exception 'This booking changed. Refresh and try again.'; end if;
  sn=(sn-'ordref'-'awb'-'courier'-'charge'-'booked'-'booked_by'-'couriers'-'quoted'-'tracking_checked'-'rate'-'returned'-'booking')||jsonb_build_object('cancelled',jsonb_build_object('ordref',sn->>'ordref','awb',sn->>'awb','at',now_s));
  d=d||jsonb_build_object('provider',null,'tracking',null,'tracking_status',null,'tracking_events','[]'::jsonb,
   'history',coalesce(d->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object('state','packing','at',now_s,'note','The courier booking was changed. A new tracking number follows.')),
   'internal_notes',coalesce(d->'internal_notes','[]'::jsonb)||jsonb_build_array(jsonb_build_object('text','Shipneer booking cancelled: '||reason,'at',now_s,'actor',p_actor)));
  new_state='packing';
 elsif p_action='restock' then
  if o.state!='shipped' or sn->>'ordref' is null then raise exception 'Only a shipped parcel that came back can be restocked.'; end if;
  if sn->>'returned' is null then raise exception 'The courier hasn’t reported this parcel as returned. Refresh tracking first.'; end if;
  if length(reason)<5 then raise exception 'Add a remark, for example the parcel’s condition.'; end if;
  perform 1 from bcc_batches where id in(select batch from bcc_reservations where order_id=p_id) order by id for update;
  insert into bcc_stock_moves(batch,quantity,kind,reason,actor,created) select batch,quantity,'return',p_id||' · returned by courier · '||reason,p_actor,now_s from bcc_reservations where order_id=p_id and state='consumed';
  update bcc_batches b set available=b.available+x.quantity from(select batch,sum(quantity)::integer quantity from bcc_reservations where order_id=p_id and state='consumed' group by batch)x where b.id=x.batch;
  update bcc_reservations set state='released' where order_id=p_id and state='consumed';
  sn=sn||jsonb_build_object('restocked',now_s);
  d=d||jsonb_build_object('history',coalesce(d->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object('state','cancelled','at',now_s,'note','The parcel came back to us. Your refund follows.')),
   'internal_notes',coalesce(d->'internal_notes','[]'::jsonb)||jsonb_build_array(jsonb_build_object('text','Returned parcel restocked: '||reason,'at',now_s,'actor',p_actor)));
  if exists(select 1 from bcc_payments where order_id=p_id and status='captured') then d=d||'{"refund":"pending_refund"}'::jsonb; end if;
  new_state='cancelled';
 else raise exception 'Unsupported shipping action';
 end if;
 update bcc_orders set state=new_state,data=d||jsonb_build_object('shipneer',sn) where id=p_id;
 return jsonb_build_object('ok',true,'state',new_state,'status',d->>'tracking_status','events',coalesce(d->'tracking_events','[]'::jsonb));
end $$;
revoke all on function public.bcc_delivery_hit(text,text,integer) from public,anon,authenticated;
revoke all on function public.bcc_delivery_save(text,jsonb,integer) from public,anon,authenticated;
revoke all on function public.bcc_ship_action(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.bcc_delivery_hit(text,text,integer) to service_role;
grant execute on function public.bcc_delivery_save(text,jsonb,integer) to service_role;
grant execute on function public.bcc_ship_action(text,text,text,jsonb) to service_role;
commit;
