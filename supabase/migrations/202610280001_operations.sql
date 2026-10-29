-- Hosted foundation. No customer records or credentials are included.
-- Every public-facing request goes through the server API; no anonymous table access.
begin;
create table if not exists public.bcc_products (
 id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
 data jsonb not null check (jsonb_typeof(data)='object'),
 draft jsonb, version integer not null default 0 check(version>=0), updated_at timestamptz not null default now()
);
create unique index if not exists bcc_product_sku on public.bcc_products(lower(data->>'sku')) where data->>'sku' is not null;
create table if not exists public.bcc_batches (
 id text primary key check(id ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$'),
 product text not null references public.bcc_products(id), expiry bigint not null,
 available integer not null check(available>=0), state text not null check(state in ('released','quarantined')),
 proof boolean not null default false, meta jsonb not null default '{"location":"Main warehouse","damaged":0,"returned_pending":0,"low_stock_threshold":5}',
 check(coalesce((meta->>'damaged')::integer,0)>=0),
 check(coalesce((meta->>'returned_pending')::integer,0)>=0),
 check(coalesce((meta->>'low_stock_threshold')::integer,5)>=0)
);
create unique index if not exists bcc_batch_lot_case on public.bcc_batches(upper(id));
create table if not exists public.bcc_orders (
 id text primary key, user_id text not null, state text not null check(state in ('pending','paid','packing','shipped','delivered','cancelled','expired')),
 data jsonb not null, created bigint not null, request_key text not null, unique(user_id,request_key)
);
create table if not exists public.bcc_reservations (
 id bigint generated always as identity primary key, order_id text not null references public.bcc_orders(id),
 batch text not null references public.bcc_batches(id), quantity integer not null check(quantity>0), expires bigint not null,
 state text not null check(state in ('held','consumed','released'))
);
create index if not exists bcc_reservations_batch on public.bcc_reservations(batch,state);
create table if not exists public.bcc_payments (
 order_id text primary key references public.bcc_orders(id), status text not null, amount integer not null check(amount>=0), captured bigint, refunded bigint
);
create table if not exists public.bcc_stock_moves (
 id bigint generated always as identity primary key, batch text not null references public.bcc_batches(id),
 quantity integer not null, kind text not null, reason text not null, actor text not null, created bigint not null default extract(epoch from now())::bigint
);
create table if not exists public.bcc_operation_requests (
 actor text not null, request_id text not null, action text not null, fingerprint text not null,
 response jsonb not null, created_at timestamptz not null default now(), primary key(actor,request_id)
);
create table if not exists public.bcc_lot_reports (
 id text primary key, product text not null references public.bcc_products(id), lot text not null references public.bcc_batches(id),
 version integer not null check(version>0), state text not null check(state in ('draft','published','superseded','withdrawn')),
 record jsonb not null default '{}', created bigint not null, updated bigint not null, published bigint, superseded bigint,
 withdrawn bigint, withdrawn_reason text, unique(product,lot,version)
);
create unique index if not exists bcc_lot_one_draft on public.bcc_lot_reports(product,lot) where state='draft';
create unique index if not exists bcc_lot_one_public on public.bcc_lot_reports(product,lot) where state='published';
create table if not exists public.bcc_media (
 id text primary key, kind text not null check(kind in ('catalog','report','review','case')),
 object_key text not null unique, mime text not null check(mime in ('image/jpeg','image/png','image/webp','application/pdf')),
 bytes integer not null check(bytes>0 and bytes<=15728640), sha256 text not null,
 owner_id text, report_id text references public.bcc_lot_reports(id), data jsonb not null default '{}', created bigint not null
);
create table if not exists public.bcc_cases (id text primary key, user_id text not null, data jsonb not null, created bigint not null);
create table if not exists public.bcc_reviews (id text primary key, user_id text not null, product text not null references public.bcc_products(id), order_id text not null references public.bcc_orders(id), data jsonb not null, unique(user_id,product,order_id));
create table if not exists public.bcc_questions (id text primary key, user_id text not null, product text not null references public.bcc_products(id), data jsonb not null, created bigint not null);
create table if not exists public.bcc_profiles (user_id text primary key, data jsonb not null default '{}');
create table if not exists public.bcc_addresses (id text primary key, user_id text not null, data jsonb not null);
create table if not exists public.bcc_bags (user_id text primary key, data jsonb not null default '[]', updated bigint not null);
create table if not exists public.bcc_settings (id text primary key, data jsonb not null);
create table if not exists public.bcc_product_versions (id bigint generated always as identity primary key, product text not null references public.bcc_products(id), data jsonb not null, created bigint not null, actor text not null);
-- An explicit singleton, never an editable profile role or public signup claim.
create table if not exists public.bcc_admin (singleton boolean primary key default true check(singleton), auth_user_id uuid not null unique, username text not null unique);
insert into public.bcc_settings(id,data) values('flags','{"ingredient_library":true,"reviews":true,"questions":true,"checkout_enabled":false}') on conflict do nothing;

create or replace function public.bcc_expire_holds(p_now bigint) returns void language plpgsql set search_path=public as $$
declare r record;
begin
 -- Lock the order first, matching payment/cancellation lock order.
 for r in select id from bcc_orders where state='pending' and exists(select 1 from bcc_reservations x where x.order_id=bcc_orders.id and x.state='held' and x.expires<=p_now) order by id for update loop
  perform 1 from bcc_batches where id in(select batch from bcc_reservations where order_id=r.id and state='held') order by id for update;
  insert into bcc_stock_moves(batch,quantity,kind,reason,actor,created) select batch,quantity,'release','Unpaid reservation expired','system',p_now from bcc_reservations where order_id=r.id and state='held';
  update bcc_batches b set available=b.available+x.quantity from (select batch,sum(quantity)::integer quantity from bcc_reservations where order_id=r.id and state='held' group by batch) x where b.id=x.batch;
  update bcc_reservations set state='released' where order_id=r.id and state='held';
  update bcc_orders set state='expired',data=data||jsonb_build_object('state','expired') where id=r.id;
 end loop;
end $$;

create or replace function public.bcc_checkout(p_user text,p_key text,p_items jsonb,p_contact jsonb,p_discount text default '') returns jsonb language plpgsql set search_path=public as $$
declare now_s bigint=extract(epoch from now())::bigint; oid text; existing bcc_orders; item jsonb; prod bcc_products; bat bcc_batches; qty integer; remaining integer; take integer; subtotal integer=0; discount integer=0; shipping integer; lines jsonb='[]'; payload jsonb;
begin
 if p_user is null or length(p_user)<8 or p_key is null or p_key !~ '^[A-Za-z0-9-]{8,100}$' then raise exception 'Invalid checkout identity'; end if;
 -- Serialise retries of the same checkout before any stock is changed.
 perform pg_advisory_xact_lock(hashtextextended(p_user||':'||p_key,0));
 select * into existing from bcc_orders where user_id=p_user and request_key=p_key;
 if found then return existing.data||jsonb_build_object('id',existing.id,'state',existing.state,'idempotent',true); end if;
 if not coalesce((select (data->>'checkout_enabled')::boolean from bcc_settings where id='flags'),false) then raise exception 'Checkout is paused'; end if;
 if jsonb_typeof(p_items)!='array' or jsonb_array_length(p_items)<1 or jsonb_array_length(p_items)>30 then raise exception 'Invalid bag'; end if;
 if (select count(*) from jsonb_array_elements(p_items)) != (select count(distinct x->>'id') from jsonb_array_elements(p_items) x) then raise exception 'Duplicate product'; end if;
 if jsonb_typeof(p_contact)!='object' or coalesce(p_contact->>'name','')='' or coalesce(p_contact->>'mobile','') !~ '^[6-9][0-9]{9}$' or coalesce(p_contact->>'pincode','') !~ '^[1-9][0-9]{5}$' or length(coalesce(p_contact->>'address',''))<5 or coalesce(p_contact->>'city','')='' or coalesce(p_contact->>'state','')='' then raise exception 'Complete the delivery address'; end if;
 perform bcc_expire_holds(now_s);
 -- Deterministic locking prevents two carts taking the same final unit.
 perform 1 from bcc_products where id in(select x->>'id' from jsonb_array_elements(p_items) x) order by id for update;
 perform 1 from bcc_batches where product in(select x->>'id' from jsonb_array_elements(p_items) x) order by id for update;
 for item in select x from jsonb_array_elements(p_items) x loop
  if coalesce(item->>'quantity','') !~ '^[0-9]+$' then raise exception 'Invalid quantity'; end if;
  qty=(item->>'quantity')::integer;
  if qty<1 or qty>10 then raise exception 'Choose a quantity between 1 and 10'; end if;
  select * into prod from bcc_products where id=item->>'id';
  if not found or not coalesce((prod.data->>'published')::boolean,false) then raise exception 'Product unavailable'; end if;
  if coalesce((prod.data->>'price')::integer,-1)<0 then raise exception 'Product price unavailable'; end if;
  if (select coalesce(sum(available),0) from bcc_batches where product=prod.id and state='released' and proof and expiry>now_s)<qty then raise exception 'Not enough released stock'; end if;
  lines=lines||jsonb_build_array(jsonb_build_object('id',prod.id,'name',prod.data->>'name','quantity',qty,'unit_price',(prod.data->>'price')::integer));
  subtotal=subtotal+(prod.data->>'price')::integer*qty;
 end loop;
 if p_discount!='' and upper(p_discount)!='PREVIEW10' then raise exception 'Discount unavailable'; end if;
 if upper(p_discount)='PREVIEW10' then discount=(subtotal+5)/10; end if;
 shipping=case when subtotal-discount>=1499 then 0 else 75 end;
 oid='BCC-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 payload=jsonb_build_object('id',oid,'items',lines,'contact',p_contact,'subtotal',subtotal,'discount',discount,'shipping',shipping,'total',subtotal-discount+shipping,'history',jsonb_build_array(jsonb_build_object('state','pending','at',now_s,'note','Stock reserved; payment pending.')),'preview',true);
 insert into bcc_orders values(oid,p_user,'pending',payload,now_s,p_key);
 insert into bcc_payments(order_id,status,amount) values(oid,'pending',subtotal-discount+shipping);
 for item in select x from jsonb_array_elements(p_items) x loop
  remaining=(item->>'quantity')::integer;
  for bat in select * from bcc_batches where product=item->>'id' and state='released' and proof and expiry>now_s and available>0 order by expiry,id loop
   take=least(remaining,bat.available);
   update bcc_batches set available=available-take where id=bat.id;
   insert into bcc_reservations(order_id,batch,quantity,expires,state) values(oid,bat.id,take,now_s+900,'held');
   insert into bcc_stock_moves(batch,quantity,kind,reason,actor,created) values(bat.id,-take,'reservation',oid,p_user,now_s);
   remaining=remaining-take;exit when remaining=0;
  end loop;
 end loop;
 return payload||jsonb_build_object('state','pending');
end $$;

create or replace function public.bcc_order_transition(p_id text,p_target text,p_actor text,p_note text,p_public_note text default '',p_tracking jsonb default '{}') returns jsonb language plpgsql set search_path=public as $$
declare o bcc_orders; pay bcc_payments; now_s bigint=extract(epoch from now())::bigint; payload jsonb;
begin
 select * into o from bcc_orders where id=p_id for update;
 if not found then raise exception 'Order not found'; end if;
 if length(trim(p_note))<5 then raise exception 'Add an action remark'; end if;
 select * into pay from bcc_payments where order_id=p_id for update;
 if p_target='paid' then
  if o.state='paid' and pay.status='captured' then return jsonb_build_object('ok',true,'idempotent',true); end if;
  if o.state!='pending' or exists(select 1 from bcc_reservations where order_id=p_id and state='held' and expires<=now_s) then raise exception 'Payment reservation expired'; end if;
  if not exists(select 1 from bcc_reservations where order_id=p_id and state='held') then raise exception 'Reservation missing'; end if;
  perform 1 from bcc_batches where id in(select batch from bcc_reservations where order_id=p_id and state='held') order by id for update;
  if exists(select 1 from bcc_reservations r join bcc_batches b on b.id=r.batch where r.order_id=p_id and r.state='held' and (b.expiry<=now_s or b.state!='released' or not b.proof)) then raise exception 'Allocated stock cannot be sold'; end if;
  update bcc_reservations set state='consumed' where order_id=p_id and state='held';
  update bcc_payments set status='captured',captured=now_s where order_id=p_id;
 elsif p_target='packing' then
  if o.state!='paid' then raise exception 'Only paid orders can be packed'; end if;
 elsif p_target='shipped' then
  if o.state not in ('paid','packing') then raise exception 'Order cannot be shipped'; end if;
  if length(coalesce(p_tracking->>'courier',''))<2 or length(coalesce(p_tracking->>'tracking',''))<3 then raise exception 'Courier and tracking are required'; end if;
  perform 1 from bcc_batches where id in(select batch from bcc_reservations where order_id=p_id) order by id for update;
  if exists(select 1 from bcc_reservations r join bcc_batches b on b.id=r.batch where r.order_id=p_id and r.state='consumed' and (b.expiry<=now_s or b.state!='released' or not b.proof)) then raise exception 'Stock cannot be dispatched'; end if;
 elsif p_target='delivered' then
  if o.state!='shipped' then raise exception 'Only shipped orders can be delivered'; end if;
 elsif p_target='cancelled' then
  if o.state='cancelled' then return jsonb_build_object('ok',true,'idempotent',true); end if;
  if o.state not in ('pending','paid','packing') then raise exception 'Order cannot be cancelled'; end if;
  perform 1 from bcc_batches where id in(select batch from bcc_reservations where order_id=p_id) order by id for update;
  insert into bcc_stock_moves(batch,quantity,kind,reason,actor,created) select batch,quantity,'release',p_note,p_actor,now_s from bcc_reservations where order_id=p_id and state in ('held','consumed');
  update bcc_batches b set available=b.available+x.quantity from(select batch,sum(quantity)::integer quantity from bcc_reservations where order_id=p_id and state in ('held','consumed') group by batch)x where b.id=x.batch;
  update bcc_reservations set state='released' where order_id=p_id and state in ('held','consumed');
 elsif p_target!='note' then raise exception 'Unsupported order action';
 end if;
 payload=o.data||p_tracking||jsonb_build_object('history',coalesce(o.data->'history','[]')||jsonb_build_array(jsonb_build_object('state',case when p_target='note' then o.state else p_target end,'at',now_s,'note',p_public_note)), 'internal_notes',coalesce(o.data->'internal_notes','[]')||jsonb_build_array(jsonb_build_object('text',p_note,'actor',p_actor,'at',now_s)));
 if p_target='paid' then payload=payload||jsonb_build_object('paid_at',now_s); end if;
 if p_target='cancelled' and pay.status='captured' then payload=payload||'{"refund":"pending_refund"}'::jsonb; end if;
 update bcc_orders set state=case when p_target='note' then o.state else p_target end,data=payload where id=p_id;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.bcc_adjust_stock(p_batch text,p_quantity integer,p_kind text,p_reason text,p_actor text,p_request text) returns jsonb language plpgsql set search_path=public as $$
declare b bcc_batches; previous bcc_operation_requests; fp text; result jsonb='{"ok":true}';
begin
 if p_request is null or p_request !~ '^[A-Za-z0-9-]{16,100}$' then raise exception 'Operation identifier required'; end if;
 fp=jsonb_build_object('batch',p_batch,'quantity',p_quantity,'kind',p_kind,'reason',p_reason)::text;
 perform pg_advisory_xact_lock(hashtextextended(p_actor||':'||p_request,0));
 select * into previous from bcc_operation_requests where actor=p_actor and request_id=p_request;
 if found then
  if previous.action!='batch_adjust' or previous.fingerprint!=fp then raise exception 'Request was already used for another change'; end if;
  return previous.response||'{"idempotent":true}'::jsonb;
 end if;
 select * into b from bcc_batches where id=p_batch for update;
 if not found then raise exception 'Batch not found'; end if;
 if p_quantity=0 or abs(p_quantity::bigint)>1000000 or b.available+p_quantity<0 or length(trim(p_reason))<5 then raise exception 'Invalid stock adjustment'; end if;
 if p_kind not in('receive','damage','write_off','count_correction') or (p_kind='receive' and p_quantity<0) or (p_kind in('damage','write_off') and p_quantity>0) then raise exception 'Invalid adjustment direction'; end if;
 update bcc_batches set available=available+p_quantity,meta=case when p_kind='damage' then jsonb_set(meta,'{damaged}',to_jsonb(coalesce((meta->>'damaged')::integer,0)-p_quantity)) else meta end where id=p_batch;
 insert into bcc_stock_moves(batch,quantity,kind,reason,actor) values(p_batch,p_quantity,p_kind,p_reason,p_actor);
 insert into bcc_operation_requests(actor,request_id,action,fingerprint,response) values(p_actor,p_request,'batch_adjust',fp,result);
 return result;
end $$;

-- RLS with no client policies: anon/authenticated clients cannot query any table.
-- A server function must authenticate/authorize the caller before using service_role.
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='public' and tablename like 'bcc\_%' escape '\' loop
  execute format('alter table public.%I enable row level security',t.tablename);
  execute format('revoke all on public.%I from anon,authenticated',t.tablename);
  execute format('grant all on public.%I to service_role',t.tablename);
 end loop;
end $$;
revoke all on function public.bcc_checkout(text,text,jsonb,jsonb,text) from public,anon,authenticated;
revoke all on function public.bcc_order_transition(text,text,text,text,text,jsonb) from public,anon,authenticated;
revoke all on function public.bcc_adjust_stock(text,integer,text,text,text,text) from public,anon,authenticated;
revoke all on function public.bcc_expire_holds(bigint) from public,anon,authenticated;
grant execute on function public.bcc_checkout(text,text,jsonb,jsonb,text),public.bcc_order_transition(text,text,text,text,text,jsonb),public.bcc_adjust_stock(text,integer,text,text,text,text),public.bcc_expire_holds(bigint) to service_role;
do $$ declare s record; begin
 for s in select sequencename from pg_sequences where schemaname='public' and sequencename like 'bcc\_%' escape '\' loop
  execute format('grant usage,select on sequence public.%I to service_role',s.sequencename);
 end loop;
end $$;
commit;
