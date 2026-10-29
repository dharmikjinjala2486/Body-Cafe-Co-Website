begin;
create or replace function public.bcc_admin_action(p_actor text,p_action text,p_data jsonb) returns jsonb language plpgsql set search_path=public as $$
declare now_s bigint=extract(epoch from now())::bigint; reason text=trim(coalesce(p_data->>'remarks','')); pid text=p_data->>'id'; key text=p_data->>'request_id'; prev bcc_operation_requests; fp text=(p_data-'request_id')::text; result jsonb='{"ok":true}'; prodrow bcc_products; batch bcc_batches; report bcc_lot_reports; doc jsonb; version_n integer; item jsonb;
begin
 if not exists(select 1 from bcc_admin where auth_user_id::text=p_actor) then raise exception 'Admin access required'; end if;
 if p_action in ('request','approve','lot_submit','lot_notice_request','lot_notice_retire_request','lot_withdraw_request') then raise exception 'Endpoint removed'; end if;
 -- All admin mutations share a lock; checkout retains independent per-row stock locks.
 perform pg_advisory_xact_lock(hashtextextended('bcc-admin-mutation',0));
 if key is not null then
  if key !~ '^[A-Za-z0-9-]{16,100}$' then raise exception 'Invalid operation identifier'; end if;
  select * into prev from bcc_operation_requests where actor=p_actor and request_id=key;
  if found then
   if prev.action!=p_action or prev.fingerprint!=fp then raise exception 'This request was already used for another change'; end if;
   return prev.response||'{"idempotent":true}'::jsonb;
  end if;
 end if;
 if p_action='product_save' then
  doc=p_data->'product';pid=doc->>'id';
  if jsonb_typeof(doc)!='object' or pid is null or pid !~ '^[a-z0-9][a-z0-9-]{1,99}$' then raise exception 'Invalid product ID'; end if;
  select * into prodrow from bcc_products where id=pid for update;
  version_n=coalesce(prodrow.version,0);
  if coalesce((p_data->>'version')::integer,-1)!=version_n then raise exception 'Product changed. Reload before saving'; end if;
  if length(trim(coalesce(doc->>'name','')))<1 or length(trim(coalesce(doc->>'sku','')))<1 then raise exception 'Name and SKU required'; end if;
  if coalesce(doc->>'price','') !~ '^[0-9]+$' or (doc->>'price')::integer>1000000 then raise exception 'Invalid price'; end if;
  if doc->>'color' !~ '^#[0-9a-fA-F]{6}$' then raise exception 'Choose a valid color'; end if;
  if exists(select 1 from bcc_products where id!=pid and (lower(data->>'sku')=lower(doc->>'sku') or lower(draft->>'sku')=lower(doc->>'sku'))) then raise exception 'SKU is already used'; end if;
  doc=doc||jsonb_build_object('version',version_n+1,'preview',true,'published',coalesce((prodrow.data->>'published')::boolean,false));
  insert into bcc_products(id,data,draft,version) values(pid,doc||'{"published":false}'::jsonb,doc,version_n+1)
  on conflict(id) do update set draft=excluded.draft,version=excluded.version,updated_at=now();
  result=jsonb_build_object('ok',true,'id',pid,'version',version_n+1);
 elsif p_action in ('product_publish','product_archive') then
  select * into prodrow from bcc_products where id=pid for update;
  if not found then raise exception 'Product not found'; end if;
  if length(reason)<5 then raise exception 'Add a publication remark'; end if;
  if p_action='product_publish' then
   if prodrow.draft is null or prodrow.version!=(p_data->>'version')::integer then raise exception 'Save and review the latest draft'; end if;
   if not exists(select 1 from jsonb_array_elements(coalesce(prodrow.draft->'gallery','[]'))x where coalesce((x->>'visible')::boolean,true)) then raise exception 'Choose a visible product image'; end if;
   doc=prodrow.draft||'{"published":true}'::jsonb;
  else doc=prodrow.data||jsonb_build_object('published',false,'version',prodrow.version+1); end if;
  insert into bcc_product_versions(product,data,created,actor) values(pid,prodrow.data,now_s,p_actor);
  update bcc_products set data=doc,draft=case when p_action='product_publish' then null else draft end,version=(doc->>'version')::integer,updated_at=now() where id=pid;
 elsif p_action='batch_create' then
  if length(reason)<5 or (p_data->>'expiry')::bigint<=now_s or (p_data->>'quantity')::integer not between 0 and 1000000 or coalesce((p_data->>'low_stock_threshold')::integer,5) not between 0 and 1000000 then raise exception 'Check batch details and opening remark'; end if;
  if coalesce(p_data->>'manufactured','')!='' and (p_data->>'manufactured')::date>current_date then raise exception 'Manufacture date cannot be in the future'; end if;
  insert into bcc_batches(id,product,expiry,available,state,proof,meta) values(pid,p_data->>'product',(p_data->>'expiry')::bigint,(p_data->>'quantity')::integer,'quarantined',false,jsonb_build_object('location',left(coalesce(p_data->>'location','Main warehouse'),160),'manufactured',p_data->>'manufactured','low_stock_threshold',coalesce((p_data->>'low_stock_threshold')::integer,5),'damaged',0,'returned_pending',0));
  insert into bcc_stock_moves(batch,quantity,kind,reason,actor) values(pid,(p_data->>'quantity')::integer,'opening',reason,p_actor);
 elsif p_action in ('batch_settings','batch_release','quarantine','batch_quarantine') then
  select * into batch from bcc_batches where id=pid for update;
  if not found then raise exception 'Batch not found'; end if;
  if length(reason)<5 then raise exception 'Add an action remark'; end if;
  if p_action='batch_settings' then
   if length(trim(coalesce(p_data->>'location','')))<1 or length(p_data->>'location')>160 or (p_data->>'low_stock_threshold')::integer not between 0 and 1000000 then raise exception 'Check location and stock alert'; end if;
   update bcc_batches set meta=meta||jsonb_build_object('location',trim(p_data->>'location'),'low_stock_threshold',(p_data->>'low_stock_threshold')::integer) where id=pid;
  elsif p_action='batch_release' then
   if batch.expiry<=now_s or p_data->'evidence_confirmed'!='true'::jsonb then raise exception 'Check evidence and expiry before release'; end if;
   update bcc_batches set proof=true,state='released' where id=pid;
  else update bcc_batches set state='quarantined' where id=pid; end if;
 elsif p_action='order_update' then
  result=bcc_order_transition(pid,p_data->>'state',p_actor,reason,coalesce(p_data->>'public_note',''),jsonb_build_object('provider',coalesce(p_data->>'provider',p_data->>'courier',''),'courier',coalesce(p_data->>'provider',p_data->>'courier',''),'tracking',coalesce(p_data->>'tracking','')));
 elsif p_action='flags_update' then
  if p_data->>'key' not in ('ingredient_library','reviews','questions','checkout_enabled') or jsonb_typeof(p_data->'value')!='boolean' or length(reason)<5 then raise exception 'Invalid feature flag'; end if;
  -- Live checkout remains disabled until the gateway adapter has been deployed.
  if p_data->>'key'='checkout_enabled' and p_data->'value'='true'::jsonb then raise exception 'Connect and verify the live payment provider before enabling hosted checkout'; end if;
  update bcc_settings set data=jsonb_set(data,array[p_data->>'key'],p_data->'value') where id='flags';
 elsif p_action='lot_draft' then
  if not exists(select 1 from bcc_batches where id=p_data->>'lot' and product=p_data->>'product') then raise exception 'Choose a lot belonging to this product'; end if;
  select * into report from bcc_lot_reports where product=p_data->>'product' and lot=p_data->>'lot' and state='draft';
  if found then return jsonb_build_object('ok',true,'id',report.id); end if;
  select coalesce(max(version),0)+1 into version_n from bcc_lot_reports where product=p_data->>'product' and lot=p_data->>'lot';
  pid='LR-'||substr(replace(gen_random_uuid()::text,'-',''),1,16);
  select record into doc from bcc_lot_reports where product=p_data->>'product' and lot=p_data->>'lot' and state='published';
  doc=coalesce(doc,'{"presentation":{"show_documents":true,"show_summary":true,"show_results":false,"show_lab":false,"show_dates":false}}')-'change_note';
  insert into bcc_lot_reports(id,product,lot,version,state,record,created,updated) values(pid,p_data->>'product',p_data->>'lot',version_n,'draft',doc,now_s,now_s);
  result=jsonb_build_object('ok',true,'id',pid,'version',version_n);
 elsif p_action in ('lot_update','lot_publish','lot_withdraw','lot_discard') then
  select * into report from bcc_lot_reports where id=pid for update;
  if not found then raise exception 'Report not found'; end if;
  if p_action='lot_withdraw' then
   reason=trim(coalesce(p_data->>'reason',''));
   if report.state!='published' or length(reason)<10 then raise exception 'Add a withdrawal reason for a published report'; end if;
   update bcc_lot_reports set state='withdrawn',withdrawn=now_s,withdrawn_reason=reason,updated=now_s where id=pid;
  else
   if report.state!='draft' then raise exception 'Only drafts can be changed'; end if;
   if p_action='lot_update' then
    if jsonb_typeof(p_data->'record')!='object' then raise exception 'Invalid report record'; end if;
    update bcc_lot_reports set record=p_data->'record',updated=now_s where id=pid;
   elsif p_action='lot_discard' then
    -- Keep metadata private and mark withdrawn; storage cleanup is a separate recoverable operation.
    update bcc_lot_reports set state='withdrawn',withdrawn=now_s,withdrawn_reason='Discarded unpublished draft',updated=now_s where id=pid;
   else
    doc=report.record;
    if length(trim(coalesce(doc->>'title','')))<1 or not exists(select 1 from bcc_media where report_id=pid) then raise exception 'Add a title and at least one report document'; end if;
    if coalesce(doc#>'{presentation,show_documents}','false')!='true'::jsonb then raise exception 'Source documents must be visible'; end if;
    if doc#>'{presentation,show_summary}'='true'::jsonb and length(trim(coalesce(doc->>'summary','')))<1 then raise exception 'Complete the selected summary'; end if;
    if doc#>'{presentation,show_results}'='true'::jsonb and jsonb_array_length(coalesce(doc->'results','[]'))<1 then raise exception 'Add the selected test results'; end if;
    if doc#>'{presentation,show_lab}'='true'::jsonb and (length(trim(coalesce(doc#>>'{lab,name}','')))<1 or length(trim(coalesce(doc->>'lab_report_no','')))<1) then raise exception 'Complete selected laboratory details'; end if;
    if doc#>'{presentation,show_dates}'='true'::jsonb and coalesce(doc#>>'{dates,issued}','')='' then raise exception 'Complete the report issue date'; end if;
    if report.version>1 and length(trim(coalesce(doc->>'change_note','')))<1 then raise exception 'Explain the report correction'; end if;
    update bcc_lot_reports set state='superseded',superseded=now_s where product=report.product and lot=report.lot and state='published';
    update bcc_lot_reports set state='published',published=now_s,updated=now_s where id=pid;
   end if;
  end if;
 elsif p_action='lot_document_remove' then
  select * into report from bcc_lot_reports where id=p_data->>'report' for update;
  if not found or report.state!='draft' then raise exception 'Only a draft document can be removed'; end if;
  delete from bcc_media where id=p_data->>'id' and report_id=report.id;
  if not found then raise exception 'Document not found'; end if;
 elsif p_action in ('review','review_reply') then
  select data into doc from bcc_reviews where id=pid for update;
  if not found then raise exception 'Review not found'; end if;
  if p_action='review_reply' then
   if doc->>'state'!='published' or length(coalesce(p_data->>'text',''))>1000 then raise exception 'Reply to a published review using at most 1000 characters'; end if;
   doc=doc||jsonb_build_object('reply',case when trim(coalesce(p_data->>'text',''))='' then null else jsonb_build_object('text',trim(p_data->>'text'),'at',now_s) end);
  else
   if p_data->>'decision' not in('publish','reject') then raise exception 'Choose publish or reject'; end if;
   if p_data->>'decision'='publish' then
    if not exists(select 1 from bcc_reviews r join bcc_orders o on o.id=r.order_id where r.id=pid and o.user_id=r.user_id and o.state='delivered' and exists(select 1 from jsonb_array_elements(o.data->'items') i where i->>'id'=r.product)) then raise exception 'A verified delivered purchase is required'; end if;
    doc=doc||jsonb_build_object('state','published','published',now_s,'reject_reason',null);
   else
    if length(trim(coalesce(p_data->>'reason','')))<3 then raise exception 'Choose a rejection reason'; end if;
    doc=doc||jsonb_build_object('state','rejected','reject_reason',p_data->>'reason');
   end if;
   for item in select to_jsonb(m) from bcc_media m where m.kind='review' and m.data->>'review_id'=pid loop
    if p_data->>'decision'='publish' and coalesce(p_data#>>array['media',item->>'id'],'') not in('approve','reject') then raise exception 'Approve or reject each photo'; end if;
    update bcc_media set data=data||jsonb_build_object('state',case when p_data->>'decision'='publish' and p_data#>>array['media',item->>'id']='approve' then 'approved' else 'rejected' end) where id=item->>'id';
   end loop;
  end if;
  update bcc_reviews set data=doc where id=pid;
 elsif p_action='question' then
  select data into doc from bcc_cases where id=pid for update;
  if not found or doc->>'kind'!='product_question' then raise exception 'Question not found'; end if;
  if length(trim(coalesce(p_data->>'answer','')))<5 or length(p_data->>'answer')>2000 then raise exception 'Write an answer between 5 and 2000 characters'; end if;
  if p_data->'publish'='true'::jsonb and (length(trim(coalesce(p_data->>'question','')))<10 or length(p_data->>'question')>600) then raise exception 'Check the public question'; end if;
  doc=doc||jsonb_build_object('public',jsonb_build_object('state',case when p_data->'publish'='true'::jsonb then 'published' else 'private' end,'answer',trim(p_data->>'answer'),'question',p_data->>'question','answered',now_s),'history',coalesce(doc->'history','[]')||jsonb_build_array(jsonb_build_object('state','answered','at',now_s)));
  update bcc_cases set data=doc where id=pid;
 elsif p_action='case_update' then
  if p_data->>'state' not in('open','investigating','escalated','resolved') then raise exception 'Invalid case status'; end if;
  update bcc_cases set data=data||jsonb_build_object('state',p_data->>'state','history',coalesce(data->'history','[]')||jsonb_build_array(jsonb_build_object('state',p_data->>'state','at',now_s,'note',coalesce(p_data->>'note',''))),'internal',coalesce(data->'internal','[]')||case when coalesce(p_data->>'internal_note','')='' then '[]'::jsonb else jsonb_build_array(jsonb_build_object('text',p_data->>'internal_note','at',now_s)) end) where id=pid;
  if not found then raise exception 'Case not found'; end if;
 else raise exception 'Unsupported hosted admin action'; end if;
 if key is not null then insert into bcc_operation_requests(actor,request_id,action,fingerprint,response) values(p_actor,key,p_action,fp,result); end if;
 return result;
end $$;
revoke all on function public.bcc_admin_action(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.bcc_admin_action(text,text,jsonb) to service_role;
commit;
