-- Results workflow transitions. The application role cannot write tables directly; it can only call
-- these functions. Each one locks the row it changes, checks the caller's role or assignment, the
-- current state and the expected version, then records an audit event in the same transaction.
-- Error codes: BF401 inactive account, BF403 not permitted, BF404 not found, BF409 state/version conflict,
-- BF422 invalid or incomplete data. Messages are written to be shown to the user.

alter default privileges in schema app revoke execute on functions from public;

create function app.require_actor(p_actor uuid) returns app.profiles
language plpgsql stable security definer set search_path = app, pg_temp as $$
declare v app.profiles;
begin
  select * into v from app.profiles where id = p_actor and active;
  if not found then raise exception 'Your account is not active for this school.' using errcode = 'BF401'; end if;
  return v;
end $$;

create function app.has_role(p_actor uuid, p_role text) returns boolean
language sql stable security definer set search_path = app, pg_temp as $$
  select exists (
    select 1 from app.role_grants g join app.profiles p on p.id = g.profile_id
    where g.profile_id = p_actor and g.role = p_role and g.revoked_at is null and p.active
  )
$$;

create function app.is_class_teacher(p_actor uuid, p_class uuid, p_term uuid) returns boolean
language sql stable security definer set search_path = app, pg_temp as $$
  select exists (select 1 from app.class_teachers where class_id = p_class and term_id = p_term and teacher_id = p_actor)
$$;

-- Independent review: a teacher never accepts or returns their own sheet. The class teacher reviews
-- other teachers' sheets; the VP Administration reviews any sheet, including the class teacher's own.
create function app.can_review_sheet(p_actor uuid, p_offering app.subject_offerings) returns boolean
language sql stable security definer set search_path = app, pg_temp as $$
  select p_offering.teacher_id <> p_actor
    and (app.is_class_teacher(p_actor, p_offering.class_id, p_offering.term_id) or app.has_role(p_actor, 'vp_admin'))
$$;

create function app.batch_for(p_offering app.subject_offerings) returns app.result_batches
language plpgsql security definer set search_path = app, pg_temp as $$
declare v app.result_batches;
begin
  insert into app.result_batches (school_id, class_id, term_id)
  values (p_offering.school_id, p_offering.class_id, p_offering.term_id)
  on conflict (class_id, term_id) do nothing;
  select * into v from app.result_batches where class_id = p_offering.class_id and term_id = p_offering.term_id for update;
  return v;
end $$;

create function app.lock_sheet(p_sheet uuid, p_version integer, out sheet app.subject_sheets, out offering app.subject_offerings)
language plpgsql security definer set search_path = app, pg_temp as $$
begin
  select * into sheet from app.subject_sheets where id = p_sheet for update;
  if not found then raise exception 'Score sheet not found.' using errcode = 'BF404'; end if;
  if sheet.version <> p_version then
    raise exception 'This sheet changed in another window or by another reviewer. Reload to see the latest version.' using errcode = 'BF409';
  end if;
  select * into offering from app.subject_offerings where id = sheet.offering_id;
end $$;

create function app.save_scores(p_actor uuid, p_sheet uuid, p_version integer, p_rows jsonb) returns integer
language plpgsql security definer set search_path = app, pg_temp as $$
declare
  v_sheet app.subject_sheets; v_offering app.subject_offerings; v_policy app.grading_policies;
  v_lock record; v_row jsonb; v_enrolment uuid; v_ca numeric; v_exam numeric; v_attendance text; v_version integer;
begin
  perform app.require_actor(p_actor);
  select * into v_lock from app.lock_sheet(p_sheet, p_version);
  v_sheet := v_lock.sheet; v_offering := v_lock.offering;
  if v_offering.teacher_id <> p_actor then raise exception 'Only the assigned subject teacher can enter these scores.' using errcode = 'BF403'; end if;
  if v_sheet.status not in ('draft', 'returned') then raise exception 'This sheet has been submitted and is locked for review.' using errcode = 'BF409'; end if;
  select g.* into v_policy from app.terms t join app.grading_policies g on g.id = t.grading_policy_id where t.id = v_offering.term_id;

  for v_row in select * from jsonb_array_elements(p_rows) loop
    v_enrolment := (v_row ->> 'enrolmentId')::uuid;
    if not exists (select 1 from app.enrolments where id = v_enrolment and class_id = v_offering.class_id and term_id = v_offering.term_id) then
      raise exception 'A student on this sheet is not enrolled in the class for this term.' using errcode = 'BF422';
    end if;
    v_attendance := coalesce(v_row ->> 'attendance', 'present');
    if v_attendance not in ('present', 'absent', 'exempt') then raise exception 'Attendance must be present, absent or exempt.' using errcode = 'BF422'; end if;
    v_ca := case when v_attendance = 'present' then (v_row ->> 'ca')::numeric end;
    v_exam := case when v_attendance = 'present' then (v_row ->> 'exam')::numeric end;
    if v_ca is not null and (v_ca < 0 or v_ca > v_policy.ca_max) then
      raise exception 'CA scores must be between 0 and %.', trim_scale(v_policy.ca_max) using errcode = 'BF422';
    end if;
    if v_exam is not null and (v_exam < 0 or v_exam > v_policy.exam_max) then
      raise exception 'Exam scores must be between 0 and %.', trim_scale(v_policy.exam_max) using errcode = 'BF422';
    end if;
    insert into app.scores (sheet_id, enrolment_id, ca, exam, attendance, updated_by)
    values (p_sheet, v_enrolment, v_ca, v_exam, v_attendance, p_actor)
    on conflict (sheet_id, enrolment_id) do update
      set ca = excluded.ca, exam = excluded.exam, attendance = excluded.attendance, updated_by = excluded.updated_by, updated_at = now()
      where (scores.ca, scores.exam, scores.attendance) is distinct from (excluded.ca, excluded.exam, excluded.attendance);
  end loop;

  update app.subject_sheets set version = version + 1, updated_at = now() where id = p_sheet returning version into v_version;
  return v_version;
end $$;

create function app.submit_sheet(p_actor uuid, p_sheet uuid, p_version integer) returns integer
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_lock record; v_sheet app.subject_sheets; v_offering app.subject_offerings; v_batch app.result_batches; v_version integer;
begin
  perform app.require_actor(p_actor);
  select * into v_lock from app.lock_sheet(p_sheet, p_version);
  v_sheet := v_lock.sheet; v_offering := v_lock.offering;
  if v_offering.teacher_id <> p_actor then raise exception 'Only the assigned subject teacher can submit this sheet.' using errcode = 'BF403'; end if;
  if v_sheet.status not in ('draft', 'returned') then raise exception 'This sheet has already been submitted.' using errcode = 'BF409'; end if;
  if not exists (select 1 from app.enrolments where class_id = v_offering.class_id and term_id = v_offering.term_id) then
    raise exception 'There are no students enrolled in this class for the term.' using errcode = 'BF422';
  end if;
  if exists (
    select 1 from app.enrolments e
    where e.class_id = v_offering.class_id and e.term_id = v_offering.term_id
      and not exists (
        select 1 from app.scores s where s.sheet_id = p_sheet and s.enrolment_id = e.id
          and (s.attendance <> 'present' or (s.ca is not null and s.exam is not null))
      )
  ) then
    raise exception 'Every student needs both a CA and an exam score, or must be marked absent or exempt, before you submit.' using errcode = 'BF422';
  end if;
  v_batch := app.batch_for(v_offering);
  if v_batch.status not in ('compiling', 'returned') then
    raise exception 'This class''s results are already past class approval.' using errcode = 'BF409';
  end if;

  update app.subject_sheets
    set status = 'submitted', revision = case when status = 'returned' then revision + 1 else revision end,
        version = version + 1, submitted_at = now(), return_reason = null, accepted_by = null, accepted_at = null, updated_at = now()
    where id = p_sheet returning version into v_version;
  insert into app.workflow_events (school_id, sheet_id, batch_id, actor_id, action, revision)
    select v_offering.school_id, p_sheet, v_batch.id, p_actor, 'sheet_submitted', revision from app.subject_sheets where id = p_sheet;
  return v_version;
end $$;

create function app.review_sheet(p_actor uuid, p_sheet uuid, p_version integer, p_accept boolean, p_reason text) returns integer
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_lock record; v_sheet app.subject_sheets; v_offering app.subject_offerings; v_batch app.result_batches; v_version integer;
begin
  perform app.require_actor(p_actor);
  select * into v_lock from app.lock_sheet(p_sheet, p_version);
  v_sheet := v_lock.sheet; v_offering := v_lock.offering;
  if not app.can_review_sheet(p_actor, v_offering) then
    raise exception 'You cannot review this sheet. Teachers never review their own scores.' using errcode = 'BF403';
  end if;
  v_batch := app.batch_for(v_offering);
  if v_batch.status not in ('compiling', 'returned') then
    raise exception 'This class has been approved. The VP must return it before sheets can change.' using errcode = 'BF409';
  end if;
  if p_accept and v_sheet.status <> 'submitted' then raise exception 'Only a submitted sheet can be accepted.' using errcode = 'BF409'; end if;
  if not p_accept and v_sheet.status not in ('submitted', 'accepted') then raise exception 'Only a submitted or accepted sheet can be returned.' using errcode = 'BF409'; end if;
  if not p_accept and length(trim(coalesce(p_reason, ''))) < 5 then
    raise exception 'Tell the teacher what needs correcting (at least 5 characters).' using errcode = 'BF422';
  end if;

  update app.subject_sheets
    set status = case when p_accept then 'accepted' else 'returned' end,
        return_reason = case when p_accept then null else trim(p_reason) end,
        accepted_by = case when p_accept then p_actor end, accepted_at = case when p_accept then now() end,
        version = version + 1, updated_at = now()
    where id = p_sheet returning version into v_version;
  insert into app.workflow_events (school_id, sheet_id, batch_id, actor_id, action, reason, revision)
    values (v_offering.school_id, p_sheet, v_batch.id, p_actor, case when p_accept then 'sheet_accepted' else 'sheet_returned' end,
            case when p_accept then null else trim(p_reason) end, v_sheet.revision);
  return v_version;
end $$;

create function app.lock_batch(p_batch uuid, p_version integer) returns app.result_batches
language plpgsql security definer set search_path = app, pg_temp as $$
declare v app.result_batches;
begin
  select * into v from app.result_batches where id = p_batch for update;
  if not found then raise exception 'Class results not found.' using errcode = 'BF404'; end if;
  if v.version <> p_version then
    raise exception 'These class results changed since you opened them. Reload to see the latest version.' using errcode = 'BF409';
  end if;
  return v;
end $$;

-- A batch is only valid while every sheet still matches the revision the class teacher approved.
create function app.batch_sheets_intact(p_batch uuid) returns boolean
language sql stable security definer set search_path = app, pg_temp as $$
  select not exists (
    select 1 from app.batch_sheets bs join app.subject_sheets s on s.id = bs.sheet_id
    where bs.batch_id = p_batch and (s.status <> 'accepted' or s.revision <> bs.revision)
  ) and exists (select 1 from app.batch_sheets where batch_id = p_batch)
$$;

create function app.class_approve(p_actor uuid, p_batch uuid, p_version integer) returns integer
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_batch app.result_batches; v_version integer;
begin
  perform app.require_actor(p_actor);
  v_batch := app.lock_batch(p_batch, p_version);
  if not app.is_class_teacher(p_actor, v_batch.class_id, v_batch.term_id) then
    raise exception 'Only this class''s class teacher can approve its results.' using errcode = 'BF403';
  end if;
  if v_batch.status not in ('compiling', 'returned') then raise exception 'These results are not waiting for class approval.' using errcode = 'BF409'; end if;
  if not exists (select 1 from app.subject_offerings where class_id = v_batch.class_id and term_id = v_batch.term_id) then
    raise exception 'No subjects are set up for this class.' using errcode = 'BF422';
  end if;
  if exists (
    select 1 from app.subject_offerings o left join app.subject_sheets s on s.offering_id = o.id
    where o.class_id = v_batch.class_id and o.term_id = v_batch.term_id and (s.id is null or s.status <> 'accepted')
  ) then
    raise exception 'Every subject sheet must be accepted before the class can be approved.' using errcode = 'BF422';
  end if;

  delete from app.batch_sheets where batch_id = p_batch;
  insert into app.batch_sheets (batch_id, sheet_id, revision)
    select p_batch, s.id, s.revision from app.subject_offerings o join app.subject_sheets s on s.offering_id = o.id
    where o.class_id = v_batch.class_id and o.term_id = v_batch.term_id;
  update app.result_batches set status = 'class_approved', return_reason = null, version = version + 1, updated_at = now()
    where id = p_batch returning version into v_version;
  insert into app.workflow_events (school_id, batch_id, actor_id, action) values (v_batch.school_id, p_batch, p_actor, 'class_approved');
  return v_version;
end $$;

create function app.vp_decide(p_actor uuid, p_batch uuid, p_version integer, p_approve boolean, p_reason text) returns integer
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_batch app.result_batches; v_version integer;
begin
  perform app.require_actor(p_actor);
  v_batch := app.lock_batch(p_batch, p_version);
  if not app.has_role(p_actor, 'vp_admin') then raise exception 'Only the Vice Principal (Administration) can make this decision.' using errcode = 'BF403'; end if;
  if p_approve then
    if v_batch.status <> 'class_approved' then raise exception 'Only class-approved results can receive final approval.' using errcode = 'BF409'; end if;
    if app.is_class_teacher(p_actor, v_batch.class_id, v_batch.term_id) then
      raise exception 'You are this class''s class teacher, so another VP must give final approval.' using errcode = 'BF403';
    end if;
    if not app.batch_sheets_intact(p_batch) then raise exception 'A subject sheet changed after class approval. Return the class for review.' using errcode = 'BF409'; end if;
  else
    if v_batch.status not in ('class_approved', 'vp_approved') then raise exception 'Only approved, unpublished results can be returned.' using errcode = 'BF409'; end if;
    if length(trim(coalesce(p_reason, ''))) < 5 then raise exception 'Tell the class teacher what needs attention (at least 5 characters).' using errcode = 'BF422'; end if;
  end if;

  update app.result_batches
    set status = case when p_approve then 'vp_approved' else 'returned' end,
        return_reason = case when p_approve then null else trim(p_reason) end, version = version + 1, updated_at = now()
    where id = p_batch returning version into v_version;
  insert into app.workflow_events (school_id, batch_id, actor_id, action, reason)
    values (v_batch.school_id, p_batch, p_actor, case when p_approve then 'vp_approved' else 'vp_returned' end, case when p_approve then null else trim(p_reason) end);
  return v_version;
end $$;

create function app.publish_batch(p_actor uuid, p_batch uuid, p_version integer) returns integer
language plpgsql security definer set search_path = app, pg_temp as $$
declare v_batch app.result_batches; v_policy app.grading_policies; v_version integer; v_count integer;
begin
  perform app.require_actor(p_actor);
  v_batch := app.lock_batch(p_batch, p_version);
  if not app.has_role(p_actor, 'publisher') then raise exception 'You do not have permission to publish results.' using errcode = 'BF403'; end if;
  if v_batch.status <> 'vp_approved' then raise exception 'Only VP-approved results can be published.' using errcode = 'BF409'; end if;
  if not app.batch_sheets_intact(p_batch) then raise exception 'A subject sheet changed after approval. These results cannot be published.' using errcode = 'BF409'; end if;
  select g.* into v_policy from app.terms t join app.grading_policies g on g.id = t.grading_policy_id where t.id = v_batch.term_id;

  update app.published_reports set superseded_at = now()
    where superseded_at is null and enrolment_id in (select id from app.enrolments where class_id = v_batch.class_id and term_id = v_batch.term_id);

  insert into app.published_reports (school_id, batch_id, enrolment_id, student_id, class_id, term_id, revision, grading_policy_id, snapshot, published_by)
  select v_batch.school_id, p_batch, e.id, e.student_id, e.class_id, e.term_id,
    coalesce((select max(revision) from app.published_reports r where r.enrolment_id = e.id), 0) + 1,
    v_policy.id,
    jsonb_build_object(
      'studentName', p.full_name, 'admissionNumber', p.admission_number, 'className', c.name,
      'termName', t.name, 'sessionName', ses.name,
      'policy', jsonb_build_object('name', v_policy.name, 'version', v_policy.version, 'caMax', v_policy.ca_max,
        'examMax', v_policy.exam_max, 'passMark', v_policy.pass_mark, 'schoolApproved', v_policy.school_approved),
      'subjects', subj.items, 'totalScore', subj.total, 'average', subj.average, 'gradedSubjects', subj.graded
    ),
    p_actor
  from app.enrolments e
  join app.profiles p on p.id = e.student_id
  join app.classes c on c.id = e.class_id
  join app.terms t on t.id = e.term_id
  join app.academic_sessions ses on ses.id = t.session_id
  cross join lateral (
    select jsonb_agg(jsonb_build_object(
             'subject', sb.name, 'ca', sc.ca, 'exam', sc.exam, 'attendance', sc.attendance,
             'total', x.total, 'grade', x.grade, 'passed', x.total >= v_policy.pass_mark
           ) order by sb.name) as items,
           sum(x.total) as total, round(avg(x.total), 2) as average, count(x.total) as graded
    from app.subject_offerings o
    join app.subjects sb on sb.id = o.subject_id
    join app.subject_sheets sh on sh.offering_id = o.id
    left join app.scores sc on sc.sheet_id = sh.id and sc.enrolment_id = e.id
    cross join lateral (select case when sc.attendance = 'present' then sc.ca + sc.exam end as total) base
    cross join lateral (
      select base.total,
        (select b ->> 'grade' from jsonb_array_elements(v_policy.bands) b
         where base.total >= (b ->> 'min')::numeric order by (b ->> 'min')::numeric desc limit 1) as grade
    ) x
    where o.class_id = e.class_id and o.term_id = e.term_id
  ) subj
  where e.class_id = v_batch.class_id and e.term_id = v_batch.term_id;
  get diagnostics v_count = row_count;
  if v_count = 0 then raise exception 'There are no enrolled students to publish.' using errcode = 'BF422'; end if;

  update app.result_batches set status = 'published', version = version + 1, updated_at = now()
    where id = p_batch returning version into v_version;
  insert into app.workflow_events (school_id, batch_id, actor_id, action) values (v_batch.school_id, p_batch, p_actor, 'published');
  return v_version;
end $$;
