import "server-only";
import { getDatabase } from "@/lib/db/neon";
import { canViewClass, hasRole, type Actor } from "@/lib/portal/actor";

export type SheetStatus = "draft" | "submitted" | "returned" | "accepted";
export type BatchStatus = "compiling" | "class_approved" | "returned" | "vp_approved" | "published";

export type Policy = { name: string; caMax: number; examMax: number; passMark: number; schoolApproved: boolean; bands: { grade: string; min: number }[] };

const toPolicy = (row: Record<string, unknown>): Policy => ({
  name: String(row.policy_name), caMax: Number(row.ca_max), examMax: Number(row.exam_max), passMark: Number(row.pass_mark),
  schoolApproved: Boolean(row.school_approved), bands: row.bands as Policy["bands"],
});

export async function overviewCounts(actor: Actor) {
  const sql = getDatabase();
  const termId = actor.term?.id ?? null;
  const [teaching] = await sql`
    select count(*) filter (where s.status in ('draft', 'returned'))::int as to_complete,
           count(*) filter (where s.status = 'returned')::int as returned
    from app.subject_offerings o join app.subject_sheets s on s.offering_id = o.id
    where o.teacher_id = ${actor.profileId} and o.term_id = ${termId}`;
  const [review] = await sql`
    select count(*)::int as awaiting from app.subject_sheets s join app.subject_offerings o on o.id = s.offering_id
    where s.status = 'submitted' and o.term_id = ${termId} and o.teacher_id <> ${actor.profileId}
      and (exists (select 1 from app.class_teachers ct where ct.class_id = o.class_id and ct.term_id = o.term_id and ct.teacher_id = ${actor.profileId})
           or (${hasRole(actor, "vp_admin")} and exists (select 1 from app.class_teachers ct where ct.class_id = o.class_id and ct.term_id = o.term_id and ct.teacher_id = o.teacher_id)))`;
  const [batches] = await sql`
    select count(*) filter (where status = 'class_approved')::int as for_vp,
           count(*) filter (where status = 'vp_approved')::int as for_publication
    from app.result_batches where term_id = ${termId}`;
  const [results] = await sql`select count(*)::int as published from app.published_reports where student_id = ${actor.profileId} and superseded_at is null`;
  return { toComplete: teaching.to_complete, returned: teaching.returned, awaitingReview: review.awaiting, forVp: batches.for_vp, forPublication: batches.for_publication, publishedResults: results.published };
}

export async function teachingSheets(actor: Actor) {
  const sql = getDatabase();
  const rows = await sql`
    select s.id, s.status, s.revision, s.return_reason, s.updated_at, c.name as class_name, sb.name as subject_name,
      (select count(*)::int from app.enrolments e where e.class_id = o.class_id and e.term_id = o.term_id) as students,
      (select count(*)::int from app.scores sc where sc.sheet_id = s.id and (sc.attendance <> 'present' or (sc.ca is not null and sc.exam is not null))) as completed
    from app.subject_offerings o
    join app.subject_sheets s on s.offering_id = o.id
    join app.classes c on c.id = o.class_id
    join app.subjects sb on sb.id = o.subject_id
    where o.teacher_id = ${actor.profileId} and o.term_id = ${actor.term?.id ?? null}
    order by c.name, sb.name`;
  return rows.map(row => ({
    id: String(row.id), status: row.status as SheetStatus, revision: Number(row.revision), returnReason: row.return_reason as string | null,
    className: String(row.class_name), subjectName: String(row.subject_name), students: Number(row.students), completed: Number(row.completed),
  }));
}

export type SheetDetail = Awaited<ReturnType<typeof sheetDetail>>;

/** Returns a sheet only to its subject teacher, a reviewer for that class, or school oversight roles. */
export async function sheetDetail(actor: Actor, sheetId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(sheetId)) return null;
  const sql = getDatabase();
  const [sheet] = await sql`
    select s.id, s.status, s.revision, s.version, s.return_reason, s.submitted_at, s.accepted_at,
      o.teacher_id, o.class_id, o.term_id, c.name as class_name, sb.name as subject_name, teacher.full_name as teacher_name,
      ct.teacher_id as class_teacher_id, b.status as batch_status,
      g.name as policy_name, g.ca_max, g.exam_max, g.pass_mark, g.school_approved, g.bands
    from app.subject_sheets s
    join app.subject_offerings o on o.id = s.offering_id
    join app.classes c on c.id = o.class_id
    join app.subjects sb on sb.id = o.subject_id
    join app.profiles teacher on teacher.id = o.teacher_id
    join app.terms t on t.id = o.term_id
    join app.grading_policies g on g.id = t.grading_policy_id
    left join app.class_teachers ct on ct.class_id = o.class_id and ct.term_id = o.term_id
    left join app.result_batches b on b.class_id = o.class_id and b.term_id = o.term_id
    where s.id = ${sheetId}`;
  if (!sheet) return null;
  const isTeacher = sheet.teacher_id === actor.profileId;
  if (!isTeacher && !canViewClass(actor, String(sheet.class_id))) return null;

  const students = await sql`
    select e.id as enrolment_id, p.full_name, p.admission_number, sc.ca, sc.exam, sc.attendance
    from app.enrolments e join app.profiles p on p.id = e.student_id
    left join app.scores sc on sc.sheet_id = ${sheetId} and sc.enrolment_id = e.id
    where e.class_id = ${sheet.class_id} and e.term_id = ${sheet.term_id}
    order by p.admission_number`;
  const history = await sql`
    select w.action, w.reason, w.revision, w.created_at, p.full_name as actor_name
    from app.workflow_events w join app.profiles p on p.id = w.actor_id
    where w.sheet_id = ${sheetId} order by w.created_at desc limit 20`;
  const ownSheetOfClassTeacher = sheet.class_teacher_id === sheet.teacher_id;
  const batchOpen = !sheet.batch_status || ["compiling", "returned"].includes(String(sheet.batch_status));
  // Mirrors app.can_review_sheet: never your own sheet; class teacher for the class, or the VP.
  const reviewer = !isTeacher && (sheet.class_teacher_id === actor.profileId || hasRole(actor, "vp_admin"));
  return {
    id: String(sheet.id), status: sheet.status as SheetStatus, revision: Number(sheet.revision), version: Number(sheet.version),
    returnReason: sheet.return_reason as string | null, className: String(sheet.class_name), classId: String(sheet.class_id),
    subjectName: String(sheet.subject_name), teacherName: String(sheet.teacher_name), policy: toPolicy(sheet),
    isTeacher, canEdit: isTeacher && ["draft", "returned"].includes(String(sheet.status)),
    canReview: reviewer && batchOpen, ownSheetOfClassTeacher,
    students: students.map(row => ({
      enrolmentId: String(row.enrolment_id), name: String(row.full_name), admissionNumber: String(row.admission_number),
      ca: row.ca === null ? null : Number(row.ca), exam: row.exam === null ? null : Number(row.exam),
      attendance: (row.attendance ?? "present") as "present" | "absent" | "exempt",
    })),
    history: history.map(row => ({ action: String(row.action), reason: row.reason as string | null, revision: row.revision as number | null, at: new Date(row.created_at), actor: String(row.actor_name) })),
  };
}

export async function visibleClasses(actor: Actor) {
  const sql = getDatabase();
  const rows = await sql`
    select c.id, c.name, coalesce(b.status, 'compiling') as status, ct.teacher_id as class_teacher_id, teacher.full_name as class_teacher_name,
      (select count(*)::int from app.subject_offerings o where o.class_id = c.id and o.term_id = ${actor.term?.id ?? null}) as subjects,
      (select count(*)::int from app.subject_offerings o join app.subject_sheets s on s.offering_id = o.id
        where o.class_id = c.id and o.term_id = ${actor.term?.id ?? null} and s.status = 'accepted') as accepted
    from app.classes c
    left join app.class_teachers ct on ct.class_id = c.id and ct.term_id = ${actor.term?.id ?? null}
    left join app.profiles teacher on teacher.id = ct.teacher_id
    left join app.result_batches b on b.class_id = c.id and b.term_id = ${actor.term?.id ?? null}
    order by c.name`;
  return rows.filter(row => canViewClass(actor, String(row.id))).map(row => ({
    id: String(row.id), name: String(row.name), status: row.status as BatchStatus, classTeacherName: row.class_teacher_name as string | null,
    subjects: Number(row.subjects), accepted: Number(row.accepted),
  }));
}

export async function classDetail(actor: Actor, classId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(classId) || !canViewClass(actor, classId) || !actor.term) return null;
  const sql = getDatabase();
  const [klass] = await sql`
    select c.id, c.name, ct.teacher_id as class_teacher_id, teacher.full_name as class_teacher_name,
      b.id as batch_id, coalesce(b.status, 'compiling') as status, b.version, b.return_reason,
      g.name as policy_name, g.ca_max, g.exam_max, g.pass_mark, g.school_approved, g.bands
    from app.classes c
    join app.terms t on t.id = ${actor.term.id}
    join app.grading_policies g on g.id = t.grading_policy_id
    left join app.class_teachers ct on ct.class_id = c.id and ct.term_id = t.id
    left join app.profiles teacher on teacher.id = ct.teacher_id
    left join app.result_batches b on b.class_id = c.id and b.term_id = t.id
    where c.id = ${classId}`;
  if (!klass) return null;
  const sheets = await sql`
    select s.id, s.status, s.revision, sb.name as subject_name, p.full_name as teacher_name, o.teacher_id
    from app.subject_offerings o join app.subject_sheets s on s.offering_id = o.id
    join app.subjects sb on sb.id = o.subject_id join app.profiles p on p.id = o.teacher_id
    where o.class_id = ${classId} and o.term_id = ${actor.term.id} order by sb.name`;
  const scores = await sql`
    select e.id as enrolment_id, p.full_name, p.admission_number, s.id as sheet_id, sc.ca, sc.exam, sc.attendance
    from app.enrolments e join app.profiles p on p.id = e.student_id
    join app.subject_offerings o on o.class_id = e.class_id and o.term_id = e.term_id
    join app.subject_sheets s on s.offering_id = o.id
    left join app.scores sc on sc.sheet_id = s.id and sc.enrolment_id = e.id
    where e.class_id = ${classId} and e.term_id = ${actor.term.id}
    order by p.admission_number`;
  const history = klass.batch_id ? await sql`
    select w.action, w.reason, w.created_at, p.full_name as actor_name, sb.name as subject_name
    from app.workflow_events w join app.profiles p on p.id = w.actor_id
    left join app.subject_sheets s on s.id = w.sheet_id left join app.subject_offerings o on o.id = s.offering_id left join app.subjects sb on sb.id = o.subject_id
    where w.batch_id = ${klass.batch_id} order by w.created_at desc limit 30` : [];

  const students = new Map<string, { enrolmentId: string; name: string; admissionNumber: string; totals: Record<string, number | null | "absent" | "exempt"> }>();
  for (const row of scores) {
    const entry = students.get(String(row.enrolment_id)) ?? { enrolmentId: String(row.enrolment_id), name: String(row.full_name), admissionNumber: String(row.admission_number), totals: {} };
    entry.totals[String(row.sheet_id)] = row.attendance && row.attendance !== "present" ? row.attendance : row.ca === null || row.exam === null ? null : Number(row.ca) + Number(row.exam);
    students.set(entry.enrolmentId, entry);
  }
  const status = klass.status as BatchStatus;
  const isClassTeacher = klass.class_teacher_id === actor.profileId;
  return {
    id: String(klass.id), name: String(klass.name), classTeacherName: klass.class_teacher_name as string | null,
    batchId: klass.batch_id as string | null, status, version: Number(klass.version ?? 0), returnReason: klass.return_reason as string | null,
    policy: toPolicy(klass),
    sheets: sheets.map(row => ({ id: String(row.id), status: row.status as SheetStatus, revision: Number(row.revision), subjectName: String(row.subject_name), teacherName: String(row.teacher_name), ownSheet: row.teacher_id === actor.profileId })),
    students: [...students.values()],
    history: history.map(row => ({ action: String(row.action), reason: row.reason as string | null, at: new Date(row.created_at), actor: String(row.actor_name), subject: row.subject_name as string | null })),
    canClassApprove: isClassTeacher && !!klass.batch_id && ["compiling", "returned"].includes(status),
    canVpDecide: hasRole(actor, "vp_admin") && !!klass.batch_id && ["class_approved", "vp_approved"].includes(status),
    vpIsClassTeacher: isClassTeacher,
    canPublish: hasRole(actor, "publisher") && status === "vp_approved",
  };
}

export async function studentReports(actor: Actor) {
  const sql = getDatabase();
  const rows = await sql`
    select id, revision, snapshot, published_at from app.published_reports
    where student_id = ${actor.profileId} and superseded_at is null order by published_at desc`;
  return rows.map(row => ({ id: String(row.id), revision: Number(row.revision), publishedAt: new Date(row.published_at), snapshot: row.snapshot as ReportSnapshot }));
}

export type ReportSnapshot = {
  studentName: string; admissionNumber: string; className: string; termName: string; sessionName: string;
  policy: { name: string; version: number; caMax: number; examMax: number; passMark: number; schoolApproved: boolean };
  subjects: { subject: string; ca: number | null; exam: number | null; attendance: string; total: number | null; grade: string | null; passed: boolean | null }[];
  totalScore: number | null; average: number | null; gradedSubjects: number;
};

/** Director statistics use published, current report revisions only. Pending work appears as counts. */
export async function directorStatistics(termId: string, classId: string | null, subject: string | null) {
  const sql = getDatabase();
  const [summary] = await sql`
    select count(*)::int as students, round(avg((snapshot ->> 'average')::numeric), 2) as average, max(published_at) as last_published
    from app.published_reports where term_id = ${termId} and superseded_at is null and (${classId}::uuid is null or class_id = ${classId}::uuid)`;
  const subjects = await sql`
    select s ->> 'subject' as subject,
      count(*) filter (where s ->> 'total' is not null)::int as graded,
      count(*) filter (where s ->> 'total' is null)::int as not_graded,
      round(avg((s ->> 'total')::numeric), 2) as average,
      count(*) filter (where (s ->> 'passed')::boolean)::int as passed
    from app.published_reports r cross join jsonb_array_elements(r.snapshot -> 'subjects') s
    where r.term_id = ${termId} and r.superseded_at is null and (${classId}::uuid is null or r.class_id = ${classId}::uuid)
      and (${subject}::text is null or s ->> 'subject' = ${subject}::text)
    group by 1 order by 1`;
  const grades = await sql`
    select s ->> 'grade' as grade, count(*)::int as students
    from app.published_reports r cross join jsonb_array_elements(r.snapshot -> 'subjects') s
    where r.term_id = ${termId} and r.superseded_at is null and s ->> 'grade' is not null
      and (${classId}::uuid is null or r.class_id = ${classId}::uuid) and (${subject}::text is null or s ->> 'subject' = ${subject}::text)
    group by 1 order by 1`;
  const pipeline = await sql`
    select c.id, c.name, coalesce(b.status, 'compiling') as status, b.updated_at
    from app.classes c left join app.result_batches b on b.class_id = c.id and b.term_id = ${termId} order by c.name`;
  const filters = await sql`
    select (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name) order by name), '[]') from app.classes) as classes,
           (select coalesce(jsonb_agg(name order by name), '[]') from app.subjects) as subjects`;
  return {
    students: Number(summary.students), average: summary.average === null ? null : Number(summary.average),
    lastPublished: summary.last_published ? new Date(summary.last_published) : null,
    subjects: subjects.map(row => ({ subject: String(row.subject), graded: Number(row.graded), notGraded: Number(row.not_graded), average: row.average === null ? null : Number(row.average), passed: Number(row.passed) })),
    grades: grades.map(row => ({ grade: String(row.grade), students: Number(row.students) })),
    pipeline: pipeline.map(row => ({ id: String(row.id), name: String(row.name), status: row.status as BatchStatus, updatedAt: row.updated_at ? new Date(row.updated_at) : null })),
    classes: filters[0].classes as { id: string; name: string }[], subjectNames: filters[0].subjects as string[],
  };
}
