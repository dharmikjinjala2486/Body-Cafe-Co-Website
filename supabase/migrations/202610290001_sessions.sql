begin;
alter table public.bcc_admin add column if not exists session_version integer not null default 0 check(session_version>=0);
create or replace function public.bcc_revoke_admin_sessions(p_actor text) returns void language plpgsql set search_path=public as $$
begin
 update bcc_admin set session_version=session_version+1 where auth_user_id::text=p_actor;
 if not found then raise exception 'Administrator not found'; end if;
end $$;
revoke all on function public.bcc_revoke_admin_sessions(text) from public,anon,authenticated;
grant execute on function public.bcc_revoke_admin_sessions(text) to service_role;
commit;
