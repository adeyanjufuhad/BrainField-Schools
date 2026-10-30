import "server-only";
import { getDatabase } from "@/lib/db/neon";
import type { Actor, Role } from "@/lib/portal/actor";
import type { BatchStatus, SheetStatus } from "@/lib/portal/queries";

/** Callers must already have checked isAdministrator(actor). */
export async function schoolSetup(actor: Actor) {
  const sql = getDatabase();
  const termId = actor.term?.id ?? null;
  const classes = await sql`
    select c.id, c.name, ct.teacher_id as class_teacher_id, coalesce(b.status, 'compiling') as status,
      (select count(*)::int from app.enrolments e where e.class_id = c.id and e.term_id = ${termId}) as students
    from app.classes c
    left join app.class_teachers ct on ct.class_id = c.id and ct.term_id = ${termId}
    left join app.result_batches b on b.class_id = c.id and b.term_id = ${termId}
    order by c.name`;
  const subjects = await sql`select id, name from app.subjects order by name`;
  const offerings = await sql`
    select o.class_id, o.subject_id, o.teacher_id, s.status from app.subject_offerings o
    join app.subject_sheets s on s.offering_id = o.id where o.term_id = ${termId}`;
  const teachers = await sql`select id, full_name from app.profiles where kind = 'staff' and active order by full_name`;
  return {
    classes: classes.map(row => ({ id: String(row.id), name: String(row.name), classTeacherId: row.class_teacher_id as string | null, status: row.status as BatchStatus, students: Number(row.students) })),
    subjects: subjects.map(row => ({ id: String(row.id), name: String(row.name) })),
    offerings: offerings.map(row => ({ classId: String(row.class_id), subjectId: String(row.subject_id), teacherId: String(row.teacher_id), status: row.status as SheetStatus })),
    teachers: teachers.map(row => ({ id: String(row.id), name: String(row.full_name) })),
  };
}

export async function schoolPeople(actor: Actor) {
  const sql = getDatabase();
  const termId = actor.term?.id ?? null;
  const people = await sql`
    select p.id, p.full_name, p.kind, p.admission_number, p.active, p.auth_user_id is not null as has_login,
      coalesce((select array_agg(g.role order by g.role) from app.role_grants g where g.profile_id = p.id and g.revoked_at is null), '{}') as roles,
      e.class_id, c.name as class_name,
      exists (select 1 from app.scores sc where sc.enrolment_id = e.id) as has_scores
    from app.profiles p
    left join app.enrolments e on e.student_id = p.id and e.term_id = ${termId}
    left join app.classes c on c.id = e.class_id
    order by p.kind, p.active desc, coalesce(p.admission_number, ''), p.full_name`;
  const classes = await sql`select id, name from app.classes order by name`;
  const events = await sql`
    select e.action, e.detail, e.created_at, actor.full_name as actor_name, target.full_name as target_name
    from app.admin_events e join app.profiles actor on actor.id = e.actor_id left join app.profiles target on target.id = e.target_profile_id
    order by e.created_at desc limit 15`;
  const mapped = people.map(row => ({
    id: String(row.id), name: String(row.full_name), kind: row.kind as "staff" | "student", admissionNumber: row.admission_number as string | null,
    active: Boolean(row.active), hasLogin: Boolean(row.has_login), roles: row.roles as Role[],
    classId: row.class_id as string | null, className: row.class_name as string | null, hasScores: Boolean(row.has_scores),
    isSelf: row.id === actor.profileId,
  }));
  return {
    staff: mapped.filter(person => person.kind === "staff"),
    students: mapped.filter(person => person.kind === "student"),
    classes: classes.map(row => ({ id: String(row.id), name: String(row.name) })),
    events: events.map(row => ({ action: String(row.action), detail: row.detail as Record<string, string>, at: new Date(row.created_at), actor: String(row.actor_name), target: row.target_name as string | null })),
  };
}
