-- Password change and administrator reset. Neon Auth holds the passwords; the school database only records
-- whether a person must replace a password someone else has seen (a new sign-in or a reset), and who did what.
-- Until it is replaced the portal shows only the change-password page and refuses every other action.

alter table app.profiles add column password_change_required boolean not null default false;

-- Same as 0005, plus: a new sign-in starts with a temporary password the administrator has seen.
create or replace function app.admin_link_account(p_actor uuid, p_profile uuid, p_auth_user_id text) returns void
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_profile app.profiles;
begin
  v_admin := app.require_admin(p_actor);
  v_profile := app.school_profile(v_admin.school_id, p_profile);
  if length(trim(coalesce(p_auth_user_id, ''))) = 0 then raise exception 'The sign-in account could not be created.' using errcode = 'BF422'; end if;
  if v_profile.auth_user_id is not null then raise exception '% already has a sign-in account.', v_profile.full_name using errcode = 'BF409'; end if;
  if exists (select 1 from app.profiles where auth_user_id = p_auth_user_id) then raise exception 'That sign-in account is already linked to someone.' using errcode = 'BF409'; end if;
  update app.profiles set auth_user_id = p_auth_user_id, password_change_required = true where id = p_profile;
  perform app.admin_log(v_admin.school_id, p_actor, 'account_linked', p_profile, '{}');
end $$;

-- Checks a reset is allowed before the server asks Neon Auth to change the password. Changes nothing.
create function app.admin_password_reset_target(p_actor uuid, p_profile uuid)
returns table (auth_user_id text, full_name text, kind text, admission_number text)
language plpgsql stable security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_profile app.profiles;
begin
  v_admin := app.require_admin(p_actor);
  v_profile := app.school_profile(v_admin.school_id, p_profile);
  if p_profile = p_actor then raise exception 'Change your own password from Account, using your current password.' using errcode = 'BF409'; end if;
  if not v_profile.active then raise exception 'Restore access for % before resetting their password.', v_profile.full_name using errcode = 'BF409'; end if;
  if v_profile.auth_user_id is null then raise exception '% has no sign-in yet. Use “Create sign-in” instead.', v_profile.full_name using errcode = 'BF409'; end if;
  return query select v_profile.auth_user_id, v_profile.full_name, v_profile.kind, v_profile.admission_number;
end $$;

-- Called after Neon Auth has accepted the new temporary password.
create function app.admin_record_password_reset(p_actor uuid, p_profile uuid) returns void
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_profile app.profiles;
begin
  v_admin := app.require_admin(p_actor);
  v_profile := app.school_profile(v_admin.school_id, p_profile);
  if p_profile = p_actor then raise exception 'Change your own password from Account, using your current password.' using errcode = 'BF409'; end if;
  update app.profiles set password_change_required = true where id = p_profile;
  perform app.admin_log(v_admin.school_id, p_actor, 'password_reset', p_profile, '{}');
end $$;

-- Called after Neon Auth has confirmed the person's current password and accepted their new one.
create function app.complete_password_change(p_actor uuid) returns void
language plpgsql security definer set search_path = app, pg_temp as $$
declare v app.profiles;
begin
  v := app.require_actor(p_actor);
  update app.profiles set password_change_required = false where id = p_actor;
  perform app.admin_log(v.school_id, p_actor, 'password_changed', p_actor, '{}');
end $$;

grant execute on function
  app.admin_password_reset_target(uuid, uuid),
  app.admin_record_password_reset(uuid, uuid),
  app.complete_password_change(uuid)
to brainfield_app;
