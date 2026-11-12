-- 12 Nov 2026: usage counters for the store assistant (POST /api/chat).
-- bcc_chat_hit counts one question against each caller key for the current hour and against the whole store for the
-- current day, and refuses once either limit is passed, so the AI bill has a ceiling. Keys are a session id and a
-- salted hash of the network address; no message text is stored.
begin;
create table if not exists public.bcc_chat_usage(scope text not null,bucket bigint not null,count integer not null default 0,primary key(scope,bucket));
alter table public.bcc_chat_usage enable row level security;
revoke all on public.bcc_chat_usage from anon,authenticated;
grant all on public.bcc_chat_usage to service_role;
create or replace function public.bcc_chat_hit(p_keys text[],p_hour_limit integer,p_day_limit integer) returns jsonb language plpgsql set search_path=public as $$
declare now_s bigint=extract(epoch from now())::bigint; hour_b bigint=now_s/3600; day_b bigint=now_s/86400; k text; n integer;
begin
 if p_keys is null or coalesce(array_length(p_keys,1),0)=0 or array_length(p_keys,1)>4 then raise exception 'Invalid chat caller'; end if;
 insert into bcc_chat_usage values('all',day_b,1) on conflict(scope,bucket) do update set count=bcc_chat_usage.count+1 returning count into n;
 if n>p_day_limit then return jsonb_build_object('ok',false,'reason','day'); end if;
 foreach k in array p_keys loop
  if k is null or length(k)<8 or length(k)>100 then raise exception 'Invalid chat caller'; end if;
  insert into bcc_chat_usage values('h:'||k,hour_b,1) on conflict(scope,bucket) do update set count=bcc_chat_usage.count+1 returning count into n;
  if n>p_hour_limit then return jsonb_build_object('ok',false,'reason','hour'); end if;
 end loop;
 if n=1 then delete from bcc_chat_usage where (scope='all' and bucket<day_b-30) or (scope<>'all' and bucket<hour_b-48); end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.bcc_chat_hit(text[],integer,integer) from public,anon,authenticated;
grant execute on function public.bcc_chat_hit(text[],integer,integer) to service_role;
commit;
