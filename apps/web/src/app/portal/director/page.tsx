import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { StatusBadge } from "@/components/portal/status-badge";
import { canViewDirectorDashboard, requireActor } from "@/lib/portal/actor";
import { directorStatistics } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Director dashboard" };

const stamp = (value: Date) => value.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
const percent = (part: number, whole: number) => whole ? `${Math.round((part / whole) * 100)}%` : "—";

export default async function Director({ searchParams }: { searchParams: Promise<{ class?: string; subject?: string }> }) {
  const actor = await requireActor();
  if (!canViewDirectorDashboard(actor)) redirect("/portal");
  if (!actor.term) return <PortalShell actor={actor} current="/portal/director" title="Director dashboard"><div className="portal-empty"><h2>No current term</h2><p>The school has not set a current term yet.</p></div></PortalShell>;

  const params = await searchParams;
  const first = await directorStatistics(actor.term.id, null, null);
  const classId = first.classes.some(item => item.id === params.class) ? params.class! : null;
  const subject = first.subjectNames.includes(params.subject ?? "") ? params.subject! : null;
  const stats = classId || subject ? await directorStatistics(actor.term.id, classId, subject) : first;
  const totalGrades = stats.grades.reduce((sum, grade) => sum + grade.students, 0);
  const refreshed = new Date();

  return <PortalShell actor={actor} current="/portal/director" title="Director dashboard" description="Published results only. Classes still in review are shown as progress counts, never as scores.">
    <form className="dashboard-filters" method="get" aria-label="Filter statistics">
      <div><label htmlFor="filter-term">Term</label><select id="filter-term" disabled defaultValue="current"><option value="current">{actor.term.sessionName} · {actor.term.name}</option></select></div>
      <div><label htmlFor="filter-class">Class</label><select id="filter-class" name="class" defaultValue={classId ?? ""}><option value="">All classes</option>{stats.classes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <div><label htmlFor="filter-subject">Subject</label><select id="filter-subject" name="subject" defaultValue={subject ?? ""}><option value="">All subjects</option>{stats.subjectNames.map(name => <option key={name} value={name}>{name}</option>)}</select></div>
      <button type="submit" className="button button-green button-small">Apply</button>
      {(classId || subject) && <Link href="/portal/director" className="text-link">Clear filters</Link>}
    </form>

    <p className="dashboard-meta">Data as of {stamp(refreshed)} · Last publication: {stats.lastPublished ? stamp(stats.lastPublished) : "none yet this term"}</p>

    {stats.students === 0 ? <div className="portal-empty"><h2>No published results yet</h2><p>Statistics appear once a class’s results are published. Progress through approval is shown below.</p></div> : <>
      <dl className="stat-tiles">
        <div><dt>Students with published results</dt><dd>{stats.students}</dd></div>
        {subject && stats.subjects[0]
          ? <div><dt>Average score · {subject}</dt><dd>{stats.subjects[0].average ?? "—"}<small>Out of 100 · {stats.subjects[0].graded} graded students</small></dd></div>
          : <div><dt>Average of student averages</dt><dd>{stats.average ?? "—"}<small>Out of 100 · {stats.students} students</small></dd></div>}
        <div><dt>Subjects shown</dt><dd>{stats.subjects.length}</dd></div>
      </dl>

      <section aria-labelledby="subject-title" className="portal-section">
        <h2 id="subject-title">By subject</h2>
        <div className="table-scroll"><table className="data-table">
          <thead><tr><th scope="col">Subject</th><th scope="col">Average score</th><th scope="col">Pass rate</th><th scope="col">Graded</th><th scope="col">Absent or exempt</th></tr></thead>
          <tbody>{stats.subjects.map(row => <tr key={row.subject}>
            <th scope="row">{row.subject}</th>
            <td className="numeric">{row.average ?? "—"}<span className="meter" aria-hidden="true"><span style={{ width: `${row.average ?? 0}%` }} /></span></td>
            <td className="numeric">{percent(row.passed, row.graded)} <span className="denominator">({row.passed} of {row.graded})</span></td>
            <td className="numeric">{row.graded}</td><td className="numeric">{row.notGraded}</td>
          </tr>)}</tbody>
        </table></div>
      </section>

      <section aria-labelledby="grades-title" className="portal-section">
        <h2 id="grades-title">Grade distribution</h2>
        <div className="table-scroll"><table className="data-table">
          <caption className="sr-only">Number of subject results at each grade</caption>
          <thead><tr><th scope="col">Grade</th><th scope="col">Subject results</th><th scope="col">Share</th></tr></thead>
          <tbody>{stats.grades.map(row => <tr key={row.grade}><th scope="row">{row.grade}</th><td className="numeric">{row.students}</td><td className="numeric">{percent(row.students, totalGrades)}<span className="meter" aria-hidden="true"><span style={{ width: percent(row.students, totalGrades) }} /></span></td></tr>)}</tbody>
        </table></div>
      </section>
    </>}

    <section aria-labelledby="pipeline-title" className="portal-section">
      <h2 id="pipeline-title">Publication progress</h2>
      <div className="table-scroll"><table className="data-table">
        <thead><tr><th scope="col">Class</th><th scope="col">Stage</th><th scope="col">Last change</th></tr></thead>
        <tbody>{stats.pipeline.map(row => <tr key={row.id}><th scope="row">{row.name}</th><td><StatusBadge status={row.status} /></td><td>{row.updatedAt ? stamp(row.updatedAt) : "—"}</td></tr>)}</tbody>
      </table></div>
    </section>
  </PortalShell>;
}
