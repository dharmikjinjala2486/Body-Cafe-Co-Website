-- 6 Nov 2026: an order now costs exactly what the bag quote shows.
-- bcc_checkout applies the pack saving (2 of one product -5%, 3 or more -10%, nearest rupee) before the discount and the
-- delivery rule, records it on each line and on the order, and charges subtotal - pack saving - discount + delivery.
create or replace function public.bcc_checkout(p_user text,p_key text,p_items jsonb,p_contact jsonb,p_discount text default '') returns jsonb language plpgsql set search_path=public as $$
declare now_s bigint=extract(epoch from now())::bigint; oid text; existing bcc_orders; item jsonb; prod bcc_products; bat bcc_batches; qty integer; remaining integer; take integer; subtotal integer=0; pack_saving integer=0; line_pack integer; pct integer; discount integer=0; shipping integer; lines jsonb='[]'; payload jsonb;
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
  -- Pack saving, exactly as the bag quote: 2 of one product save 5%, 3 or more save 10%, rounded to the nearest rupee.
  pct=case when qty>=3 then 10 when qty=2 then 5 else 0 end;
  line_pack=round((prod.data->>'price')::integer*qty*pct/100.0)::integer;
  lines=lines||jsonb_build_array(jsonb_build_object('id',prod.id,'name',prod.data->>'name','quantity',qty,'unit_price',(prod.data->>'price')::integer,'pack_pct',pct,'pack_saving',line_pack,'color',prod.data->>'color'));
  subtotal=subtotal+(prod.data->>'price')::integer*qty;
  pack_saving=pack_saving+line_pack;
 end loop;
 if p_discount!='' and upper(p_discount)!='PREVIEW10' then raise exception 'Discount unavailable'; end if;
 if upper(p_discount)='PREVIEW10' then discount=(subtotal-pack_saving+5)/10; end if;
 shipping=case when subtotal-pack_saving-discount>=1499 then 0 else 75 end;
 oid='BCC-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 payload=jsonb_build_object('id',oid,'items',lines,'contact',p_contact,'subtotal',subtotal,'pack_saving',pack_saving,'discount',discount,'shipping',shipping,'total',subtotal-pack_saving-discount+shipping,'history',jsonb_build_array(jsonb_build_object('state','pending','at',now_s,'note','Stock reserved; payment pending.')),'preview',true);
 insert into bcc_orders values(oid,p_user,'pending',payload,now_s,p_key);
 insert into bcc_payments(order_id,status,amount) values(oid,'pending',subtotal-pack_saving-discount+shipping);
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
