import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { AddStaffForm, AddStudentForm, PersonControls } from "@/components/portal/admin-forms";
import { isAdministrator, requireActor } from "@/lib/portal/actor";
import { schoolPeople } from "@/lib/portal/admin-queries";

export const metadata: Metadata = { title: "People" };

const eventLabels: Record<string, string> = {
  class_created: "Class added", subject_created: "Subject added", profile_created: "Person added", account_linked: "Sign-in created",
  profile_deactivated: "Access removed", profile_reactivated: "Access restored", role_granted: "Role granted", role_revoked: "Role removed",
  subject_teacher_set: "Subject teacher assigned", class_teacher_set: "Class teacher assigned", student_enrolled: "Student enrolled",
};
const roleNames: Record<string, string> = { administrator: "Administrator", principal: "Principal", vp_admin: "VP Administration", publisher: "Publisher", director: "Director" };
const when = (date: Date) => date.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

function Access({ active, hasLogin }: { active: boolean; hasLogin: boolean }) {
  return <span className={`status-badge ${!active ? "status-attention" : hasLogin ? "status-done" : "status-neutral"}`}>{!active ? "Access removed" : hasLogin ? "Can sign in" : "No sign-in yet"}</span>;
}

export default async function People() {
  const actor = await requireActor();
  if (!isAdministrator(actor)) redirect("/portal");
  const people = await schoolPeople(actor);
  return <PortalShell actor={actor} current="/portal/admin/people" title="People" description="Add staff and students, create their sign-ins, and manage roles and access. Removing access takes effect on their next page load.">
    <section className="workflow-panel" aria-labelledby="add-staff-title"><h2 id="add-staff-title">Add a staff member</h2><AddStaffForm /></section>
    <section className="workflow-panel" aria-labelledby="add-student-title"><h2 id="add-student-title">Add a student</h2><AddStudentForm classes={people.classes} /></section>

    <section className="portal-section" aria-labelledby="staff-title">
      <h2 id="staff-title">Staff ({people.staff.length})</h2>
      <div className="table-scroll"><table className="data-table people-table">
        <thead><tr><th scope="col">Name</th><th scope="col">Access</th><th scope="col">Roles and actions</th></tr></thead>
        <tbody>{people.staff.map(person => <tr key={person.id} className={person.active ? undefined : "row-inactive"}>
          <th scope="row"><span className="student-name">{person.name}{person.isSelf ? " (you)" : ""}</span><span className="student-id">{person.roles.map(role => roleNames[role]).join(" · ") || "Teaching staff"}</span></th>
          <td><Access active={person.active} hasLogin={person.hasLogin} /></td>
          <td><PersonControls person={person} classes={people.classes} /></td>
        </tr>)}</tbody>
      </table></div>
    </section>

    <section className="portal-section" aria-labelledby="students-title">
      <h2 id="students-title">Students ({people.students.length})</h2>
      <div className="table-scroll"><table className="data-table people-table">
        <thead><tr><th scope="col">Name</th><th scope="col">Access</th><th scope="col">Class and actions</th></tr></thead>
        <tbody>{people.students.map(person => <tr key={person.id} className={person.active ? undefined : "row-inactive"}>
          <th scope="row"><span className="student-name">{person.name}</span><span className="student-id">{person.admissionNumber} · {person.className ?? "Not enrolled this term"}{person.hasScores ? " · has scores" : ""}</span></th>
          <td><Access active={person.active} hasLogin={person.hasLogin} /></td>
          <td><PersonControls person={person} classes={people.classes} /></td>
        </tr>)}</tbody>
      </table></div>
    </section>

    {people.events.length > 0 && <section className="workflow-history" aria-labelledby="admin-history-title">
      <h2 id="admin-history-title">Recent changes</h2>
      <ol>{people.events.map((event, index) => <li key={index}>
        <strong>{eventLabels[event.action] ?? event.action}{event.target ? ` · ${event.target}` : ""}{event.detail.class ? ` · ${event.detail.class}` : ""}{event.detail.subject ? ` · ${event.detail.subject}` : ""}{event.detail.role ? ` · ${roleNames[event.detail.role] ?? event.detail.role}` : ""}</strong>
        <span>{event.actor} · <time dateTime={event.at.toISOString()}>{when(event.at)}</time></span>
      </li>)}</ol>
    </section>}
  </PortalShell>;
}
