import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { StatusBadge } from "@/components/portal/status-badge";
import { AddClassForm, AddSubjectForm, TeacherSelect } from "@/components/portal/admin-forms";
import { isAdministrator, requireActor } from "@/lib/portal/actor";
import { schoolSetup } from "@/lib/portal/admin-queries";

export const metadata: Metadata = { title: "School setup" };

export default async function SchoolSetup() {
  const actor = await requireActor();
  if (!isAdministrator(actor)) redirect("/portal");
  if (!actor.term) return <PortalShell actor={actor} current="/portal/admin" title="School setup"><div className="portal-empty"><h2>No current term</h2><p>A current term must exist before classes can be set up.</p></div></PortalShell>;
  const setup = await schoolSetup(actor);
  const offering = (classId: string, subjectId: string) => setup.offerings.find(item => item.classId === classId && item.subjectId === subjectId);

  return <PortalShell actor={actor} current="/portal/admin" title="School setup" description={`Classes, subjects and teacher assignments for ${actor.term.sessionName} · ${actor.term.name}. Assigning a subject teacher opens that class’s score sheet.`}>
    <div className="admin-add-grid">
      <section className="workflow-panel" aria-labelledby="add-class-title"><h2 id="add-class-title">Add a class</h2><AddClassForm /></section>
      <section className="workflow-panel" aria-labelledby="add-subject-title"><h2 id="add-subject-title">Add a subject</h2><AddSubjectForm /></section>
    </div>

    {setup.classes.length === 0 ? <div className="portal-empty"><h2>No classes yet</h2><p>Add the first class above.</p></div> : setup.classes.map(klass => <section key={klass.id} className="portal-section admin-class" aria-labelledby={`class-${klass.id}`}>
      <div className="admin-class-heading"><h2 id={`class-${klass.id}`}>{klass.name}</h2><span>{klass.students} {klass.students === 1 ? "student" : "students"} enrolled</span><StatusBadge status={klass.status} /></div>
      <div className="table-scroll"><table className="data-table">
        <thead><tr><th scope="col">Assignment</th><th scope="col">Teacher</th><th scope="col">Score sheet</th></tr></thead>
        <tbody>
          <tr><th scope="row">Class teacher</th><td><TeacherSelect label={`Class teacher for ${klass.name}`} teachers={setup.teachers} current={klass.classTeacherId} classId={klass.id} /></td><td>—</td></tr>
          {setup.subjects.map(subject => { const item = offering(klass.id, subject.id); return <tr key={subject.id}>
            <th scope="row">{subject.name}</th>
            <td>{item && ["submitted", "accepted"].includes(item.status)
              ? <span className="form-hint">{setup.teachers.find(teacher => teacher.id === item.teacherId)?.name ?? "Assigned"} · locked while with reviewers</span>
              : <TeacherSelect label={`${subject.name} teacher for ${klass.name}`} teachers={setup.teachers} current={item?.teacherId ?? null} classId={klass.id} subjectId={subject.id} />}</td>
            <td>{item ? <StatusBadge status={item.status} /> : <span className="form-hint">Not offered</span>}</td>
          </tr>; })}
        </tbody>
      </table></div>
    </section>)}
  </PortalShell>;
}
