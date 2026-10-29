begin;
create table if not exists public.bcc_feedback(user_id text not null,kind text not null,target text not null,data jsonb not null,created bigint not null,primary key(user_id,kind,target));
alter table public.bcc_feedback enable row level security;
revoke all on public.bcc_feedback from anon,authenticated;
grant all on public.bcc_feedback to service_role;
create or replace function public.bcc_customer_action(p_user text,p_action text,p_data jsonb) returns jsonb language plpgsql set search_path=public as $$
declare doc jsonb; target text=p_data->>'id'; at_s bigint=extract(epoch from now())::bigint; item record;
begin
 if p_user is null or length(p_user)<8 then raise exception 'Customer session required'; end if;
 if p_action='case_reply' then
  select data into doc from bcc_cases where id=target and user_id=p_user for update;
  if not found then raise exception 'Case not found'; end if;
  if length(trim(coalesce(p_data->>'message','')))<2 or length(p_data->>'message')>3000 then raise exception 'Write a message of 2 to 3000 characters'; end if;
  doc=doc||jsonb_build_object('history',coalesce(doc->'history','[]')||jsonb_build_array(jsonb_build_object('state','customer_reply','at',at_s,'message',trim(p_data->>'message'))),'state',case when doc->>'state'='resolved' then 'open' else doc->>'state' end);
  update bcc_cases set data=doc where id=target;
  return (doc-'internal'-'internal_notes')||jsonb_build_object('id',target);
 elsif p_action in('help_feedback','learn_feedback') then
  target=coalesce(p_data->>'article',p_data->>'page');
  if target is null or target !~ '^[a-z0-9][a-z0-9/-]{1,100}$' then raise exception 'Invalid feedback target'; end if;
  if jsonb_typeof(coalesce(p_data->'helpful',p_data->'clear'))!='boolean' then raise exception 'Choose yes or no'; end if;
  insert into bcc_feedback values(p_user,p_action,target,p_data,at_s) on conflict on constraint bcc_feedback_pkey do update set data=excluded.data,created=excluded.created;
 else
  if p_user not like 'customer-%' then raise exception 'Sign in to manage your account'; end if;
  if p_action in('profile','preferences') then
   perform pg_advisory_xact_lock(hashtextextended(p_user,0));
   select data into doc from bcc_profiles where user_id=p_user;
   if p_action='profile' then
    if length(trim(coalesce(p_data->>'name','')))<2 or length(p_data->>'name')>80 or length(coalesce(p_data->>'email',''))>254 then raise exception 'Check your name and email'; end if;
    doc=coalesce(doc,'{}')||jsonb_build_object('name',trim(p_data->>'name'),'email',p_data->>'email');
   else
    if jsonb_typeof(p_data->'email')!='boolean' or jsonb_typeof(p_data->'whatsapp')!='boolean' then raise exception 'Choose your communication preferences'; end if;
    doc=coalesce(doc,'{}')||jsonb_build_object('preferences',jsonb_build_object('email',p_data->'email','whatsapp',p_data->'whatsapp'));
   end if;
   insert into bcc_profiles values(p_user,doc) on conflict(user_id) do update set data=excluded.data;
  elsif p_action='address_save' then
   perform pg_advisory_xact_lock(hashtextextended(p_user,0));
   if coalesce(p_data->>'name','')='' or coalesce(p_data->>'mobile','') !~ '^[6-9][0-9]{9}$' or coalesce(p_data->>'pincode','') !~ '^[1-9][0-9]{5}$' or length(coalesce(p_data->>'address',''))<5 or coalesce(p_data->>'city','')='' or coalesce(p_data->>'state','')='' then raise exception 'Complete the address'; end if;
   if coalesce(target,'')='' then
    if (select count(*) from bcc_addresses where user_id=p_user)>=10 then raise exception 'Use up to ten addresses'; end if;
    target='ADDR-'||substr(replace(gen_random_uuid()::text,'-',''),1,10);
   elsif not exists(select 1 from bcc_addresses where id=target and user_id=p_user) then raise exception 'Address not found'; end if;
   if p_data->'default'='true'::jsonb then update bcc_addresses set data=jsonb_set(data,'{default}','false') where user_id=p_user; end if;
   doc=p_data||jsonb_build_object('id',target);
   insert into bcc_addresses values(target,p_user,doc) on conflict(id) do update set data=excluded.data;
  elsif p_action in('address_delete','address_default') then
   perform pg_advisory_xact_lock(hashtextextended(p_user,0));
   if not exists(select 1 from bcc_addresses where id=target and user_id=p_user) then raise exception 'Address not found'; end if;
   if p_action='address_delete' then delete from bcc_addresses where id=target and user_id=p_user;
   else update bcc_addresses set data=jsonb_set(data,'{default}',to_jsonb(id=target)) where user_id=p_user; end if;
  else raise exception 'Unsupported account action'; end if;
 end if;
 return jsonb_build_object('ok',true,'id',target);
end $$;
revoke all on function public.bcc_customer_action(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.bcc_customer_action(text,text,jsonb) to service_role;
commit;
