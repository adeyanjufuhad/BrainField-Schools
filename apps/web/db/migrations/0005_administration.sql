-- School administration: academic structure for the current term, profiles, role grants and account links.
-- Administrators get no implicit academic authority: these functions never touch scores, sheets' review
-- state, approvals or publication. Every change is checked against the administrator grant and the
-- administrator's school, then written to the append-only admin_events log in the same transaction.

create table app.admin_events (
  id bigint generated always as identity primary key,
  school_id uuid not null references app.schools,
  actor_id uuid not null references app.profiles,
  action text not null,
  target_profile_id uuid references app.profiles,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index admin_events_created on app.admin_events (school_id, created_at desc);

create function app.require_admin(p_actor uuid) returns app.profiles
language plpgsql stable security definer set search_path = app, pg_temp as $$
declare v app.profiles;
begin
  v := app.require_actor(p_actor);
  if not app.has_role(p_actor, 'administrator') then
    raise exception 'Only a school administrator can make this change.' using errcode = 'BF403';
  end if;
  return v;
end $$;

create function app.current_term(p_school uuid) returns app.terms
language plpgsql stable security definer set search_path = app, pg_temp as $$
declare v app.terms;
begin
  select * into v from app.terms where school_id = p_school and is_current;
  if not found then raise exception 'Set a current term before making this change.' using errcode = 'BF422'; end if;
  return v;
end $$;

create function app.school_profile(p_school uuid, p_profile uuid, p_kind text default null) returns app.profiles
language plpgsql stable security definer set search_path = app, pg_temp as $$
declare v app.profiles;
begin
  select * into v from app.profiles where id = p_profile and school_id = p_school;
  if not found then raise exception 'That person is not part of this school.' using errcode = 'BF404'; end if;
  if p_kind is not null and v.kind <> p_kind then
    raise exception '% is not a % profile.', v.full_name, case p_kind when 'staff' then 'staff' else 'student' end using errcode = 'BF422';
  end if;
  return v;
end $$;

create function app.admin_log(p_school uuid, p_actor uuid, p_action text, p_target uuid, p_detail jsonb) returns void
language sql security definer set search_path = app, pg_temp as $$
  insert into app.admin_events (school_id, actor_id, action, target_profile_id, detail) values (p_school, p_actor, p_action, p_target, coalesce(p_detail, '{}'))
$$;

create function app.admin_create_class(p_actor uuid, p_name text) returns uuid
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_id uuid; v_name text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
begin
  v_admin := app.require_admin(p_actor);
  if length(v_name) not between 2 and 60 then raise exception 'Class names need 2 to 60 characters.' using errcode = 'BF422'; end if;
  if exists (select 1 from app.classes where school_id = v_admin.school_id and lower(name) = lower(v_name)) then
    raise exception 'A class called % already exists.', v_name using errcode = 'BF409';
  end if;
  insert into app.classes (school_id, name) values (v_admin.school_id, v_name) returning id into v_id;
  perform app.admin_log(v_admin.school_id, p_actor, 'class_created', null, jsonb_build_object('class', v_name));
  return v_id;
end $$;

create function app.admin_create_subject(p_actor uuid, p_name text) returns uuid
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_id uuid; v_name text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
begin
  v_admin := app.require_admin(p_actor);
  if length(v_name) not between 2 and 60 then raise exception 'Subject names need 2 to 60 characters.' using errcode = 'BF422'; end if;
  if exists (select 1 from app.subjects where school_id = v_admin.school_id and lower(name) = lower(v_name)) then
    raise exception 'A subject called % already exists.', v_name using errcode = 'BF409';
  end if;
  insert into app.subjects (school_id, name) values (v_admin.school_id, v_name) returning id into v_id;
  perform app.admin_log(v_admin.school_id, p_actor, 'subject_created', null, jsonb_build_object('subject', v_name));
  return v_id;
end $$;

create function app.admin_create_profile(p_actor uuid, p_full_name text, p_kind text, p_admission_number text) returns uuid
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_id uuid;
  v_name text := regexp_replace(trim(coalesce(p_full_name, '')), '\s+', ' ', 'g');
  v_admission text := nullif(upper(trim(coalesce(p_admission_number, ''))), '');
begin
  v_admin := app.require_admin(p_actor);
  if length(v_name) not between 2 and 120 then raise exception 'Enter the person''s full name.' using errcode = 'BF422'; end if;
  if p_kind not in ('staff', 'student') then raise exception 'Choose staff or student.' using errcode = 'BF422'; end if;
  if p_kind = 'student' and (v_admission is null or v_admission !~ '^[A-Z0-9][A-Z0-9/-]{1,30}$') then
    raise exception 'Students need an admission number of letters, numbers, / or -.' using errcode = 'BF422';
  end if;
  if p_kind = 'staff' then v_admission := null; end if;
  if v_admission is not null and exists (select 1 from app.profiles where school_id = v_admin.school_id and admission_number = v_admission) then
    raise exception 'Admission number % is already in use.', v_admission using errcode = 'BF409';
  end if;
  insert into app.profiles (school_id, full_name, kind, admission_number) values (v_admin.school_id, v_name, p_kind, v_admission) returning id into v_id;
  perform app.admin_log(v_admin.school_id, p_actor, 'profile_created', v_id, jsonb_build_object('kind', p_kind));
  return v_id;
end $$;

-- Called by the server after it creates the Neon Auth account for this profile. Never matched by email.
create function app.admin_link_account(p_actor uuid, p_profile uuid, p_auth_user_id text) returns void
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_profile app.profiles;
begin
  v_admin := app.require_admin(p_actor);
  v_profile := app.school_profile(v_admin.school_id, p_profile);
  if length(trim(coalesce(p_auth_user_id, ''))) = 0 then raise exception 'The sign-in account could not be created.' using errcode = 'BF422'; end if;
  if v_profile.auth_user_id is not null then raise exception '% already has a sign-in account.', v_profile.full_name using errcode = 'BF409'; end if;
  if exists (select 1 from app.profiles where auth_user_id = p_auth_user_id) then raise exception 'That sign-in account is already linked to someone.' using errcode = 'BF409'; end if;
  update app.profiles set auth_user_id = p_auth_user_id where id = p_profile;
  perform app.admin_log(v_admin.school_id, p_actor, 'account_linked', p_profile, '{}');
end $$;

create function app.admin_set_active(p_actor uuid, p_profile uuid, p_active boolean) returns void
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_profile app.profiles;
begin
  v_admin := app.require_admin(p_actor);
  v_profile := app.school_profile(v_admin.school_id, p_profile);
  if p_profile = p_actor and not p_active then raise exception 'You cannot deactivate your own account.' using errcode = 'BF409'; end if;
  update app.profiles set active = p_active where id = p_profile;
  perform app.admin_log(v_admin.school_id, p_actor, case when p_active then 'profile_reactivated' else 'profile_deactivated' end, p_profile, '{}');
end $$;

create function app.admin_set_role(p_actor uuid, p_profile uuid, p_role text, p_granted boolean) returns void
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_profile app.profiles;
begin
  v_admin := app.require_admin(p_actor);
  v_profile := app.school_profile(v_admin.school_id, p_profile, 'staff');
  if p_role not in ('administrator', 'principal', 'vp_admin', 'publisher', 'director') then raise exception 'Unknown role.' using errcode = 'BF422'; end if;
  if p_profile = p_actor and p_role = 'administrator' and not p_granted then
    raise exception 'Another administrator must remove your administrator role.' using errcode = 'BF409';
  end if;
  if p_granted then
    if not app.has_role(p_profile, p_role) then
      insert into app.role_grants (profile_id, role, granted_by) values (p_profile, p_role, p_actor);
    end if;
  else
    update app.role_grants set revoked_at = now() where profile_id = p_profile and role = p_role and revoked_at is null;
  end if;
  perform app.admin_log(v_admin.school_id, p_actor, case when p_granted then 'role_granted' else 'role_revoked' end, p_profile, jsonb_build_object('role', p_role));
end $$;

-- Assigns (or reassigns) the subject teacher for a class in the current term and opens its score sheet.
create function app.admin_set_offering(p_actor uuid, p_class uuid, p_subject uuid, p_teacher uuid) returns uuid
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_term app.terms; v_teacher app.profiles; v_offering app.subject_offerings; v_status text;
begin
  v_admin := app.require_admin(p_actor);
  v_term := app.current_term(v_admin.school_id);
  v_teacher := app.school_profile(v_admin.school_id, p_teacher, 'staff');
  if not v_teacher.active then raise exception '% is deactivated.', v_teacher.full_name using errcode = 'BF422'; end if;
  if not exists (select 1 from app.classes where id = p_class and school_id = v_admin.school_id) then raise exception 'Class not found.' using errcode = 'BF404'; end if;
  if not exists (select 1 from app.subjects where id = p_subject and school_id = v_admin.school_id) then raise exception 'Subject not found.' using errcode = 'BF404'; end if;

  select * into v_offering from app.subject_offerings where class_id = p_class and subject_id = p_subject and term_id = v_term.id for update;
  if found then
    select status into v_status from app.subject_sheets where offering_id = v_offering.id;
    if v_status in ('submitted', 'accepted') then
      raise exception 'This sheet is with reviewers. Ask for it to be returned before changing its teacher.' using errcode = 'BF409';
    end if;
    update app.subject_offerings set teacher_id = p_teacher where id = v_offering.id;
  else
    if exists (select 1 from app.result_batches where class_id = p_class and term_id = v_term.id and status not in ('compiling', 'returned')) then
      raise exception 'This class''s results are already approved. Subjects cannot be added this term.' using errcode = 'BF409';
    end if;
    insert into app.subject_offerings (school_id, class_id, subject_id, term_id, teacher_id)
      values (v_admin.school_id, p_class, p_subject, v_term.id, p_teacher) returning * into v_offering;
    insert into app.subject_sheets (offering_id) values (v_offering.id);
  end if;
  perform app.admin_log(v_admin.school_id, p_actor, 'subject_teacher_set', p_teacher, jsonb_build_object('class_id', p_class, 'subject_id', p_subject));
  return v_offering.id;
end $$;

create function app.admin_set_class_teacher(p_actor uuid, p_class uuid, p_teacher uuid) returns void
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_term app.terms; v_teacher app.profiles;
begin
  v_admin := app.require_admin(p_actor);
  v_term := app.current_term(v_admin.school_id);
  v_teacher := app.school_profile(v_admin.school_id, p_teacher, 'staff');
  if not v_teacher.active then raise exception '% is deactivated.', v_teacher.full_name using errcode = 'BF422'; end if;
  if not exists (select 1 from app.classes where id = p_class and school_id = v_admin.school_id) then raise exception 'Class not found.' using errcode = 'BF404'; end if;
  if exists (select 1 from app.result_batches where class_id = p_class and term_id = v_term.id and status in ('class_approved', 'vp_approved')) then
    raise exception 'This class is with the VP. Ask for it to be returned before changing its class teacher.' using errcode = 'BF409';
  end if;
  insert into app.class_teachers (class_id, term_id, school_id, teacher_id) values (p_class, v_term.id, v_admin.school_id, p_teacher)
    on conflict (class_id, term_id) do update set teacher_id = excluded.teacher_id;
  perform app.admin_log(v_admin.school_id, p_actor, 'class_teacher_set', p_teacher, jsonb_build_object('class_id', p_class));
end $$;

-- Enrols a student for the current term, or moves them while they have no scores recorded.
create function app.admin_enrol(p_actor uuid, p_student uuid, p_class uuid) returns uuid
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_admin app.profiles; v_term app.terms; v_enrolment app.enrolments; v_id uuid;
begin
  v_admin := app.require_admin(p_actor);
  v_term := app.current_term(v_admin.school_id);
  perform app.school_profile(v_admin.school_id, p_student, 'student');
  if not exists (select 1 from app.classes where id = p_class and school_id = v_admin.school_id) then raise exception 'Class not found.' using errcode = 'BF404'; end if;
  if exists (select 1 from app.result_batches where class_id = p_class and term_id = v_term.id and status not in ('compiling', 'returned')) then
    raise exception 'This class''s results are already approved. Students cannot join it this term.' using errcode = 'BF409';
  end if;
  select * into v_enrolment from app.enrolments where student_id = p_student and term_id = v_term.id for update;
  if found then
    if v_enrolment.class_id = p_class then return v_enrolment.id; end if;
    if exists (select 1 from app.scores where enrolment_id = v_enrolment.id) then
      raise exception 'This student already has scores in their current class this term.' using errcode = 'BF409';
    end if;
    update app.enrolments set class_id = p_class where id = v_enrolment.id returning id into v_id;
  else
    insert into app.enrolments (school_id, student_id, class_id, term_id) values (v_admin.school_id, p_student, p_class, v_term.id) returning id into v_id;
  end if;
  perform app.admin_log(v_admin.school_id, p_actor, 'student_enrolled', p_student, jsonb_build_object('class_id', p_class));
  return v_id;
end $$;

grant select on app.admin_events to brainfield_app;
grant execute on function
  app.admin_create_class(uuid, text),
  app.admin_create_subject(uuid, text),
  app.admin_create_profile(uuid, text, text, text),
  app.admin_link_account(uuid, uuid, text),
  app.admin_set_active(uuid, uuid, boolean),
  app.admin_set_role(uuid, uuid, text, boolean),
  app.admin_set_offering(uuid, uuid, uuid, uuid),
  app.admin_set_class_teacher(uuid, uuid, uuid),
  app.admin_enrol(uuid, uuid, uuid)
to brainfield_app;
