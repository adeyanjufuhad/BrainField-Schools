import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { PrintButton } from "@/components/portal/print-button";
import { requireActor } from "@/lib/portal/actor";
import { studentReports } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "My results" };

const date = (value: Date) => value.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });

export default async function Results() {
  const actor = await requireActor();
  if (actor.kind !== "student") redirect("/portal");
  const reports = await studentReports(actor);
  return <PortalShell actor={actor} current="/portal/results" title="My results" description="Your published report cards. Results appear here only after the school publishes them.">
    {reports.length ? reports.map(report => { const card = report.snapshot; return <article key={report.id} className="report-card" aria-labelledby={`report-${report.id}`}>
      <header>
        <div><span className="eyebrow">{card.sessionName} · {card.termName}</span><h2 id={`report-${report.id}`}>{card.className} report card</h2><p>{card.studentName} · {card.admissionNumber}</p></div>
        <PrintButton />
      </header>
      <div className="table-scroll"><table className="data-table">
        <thead><tr><th scope="col">Subject</th><th scope="col">CA / {card.policy.caMax}</th><th scope="col">Exam / {card.policy.examMax}</th><th scope="col">Total</th><th scope="col">Grade</th><th scope="col">Result</th></tr></thead>
        <tbody>{card.subjects.map(subject => <tr key={subject.subject}>
          <th scope="row">{subject.subject}</th>
          {subject.attendance === "present" ? <><td className="numeric">{subject.ca}</td><td className="numeric">{subject.exam}</td><td className="numeric">{subject.total}</td><td className="numeric">{subject.grade}</td><td>{subject.passed ? "Pass" : "Below pass mark"}</td></>
            : <td colSpan={5} className="attendance-text">{subject.attendance}</td>}
        </tr>)}</tbody>
      </table></div>
      <dl className="report-summary"><div><dt>Total score</dt><dd>{card.totalScore ?? "—"}</dd></div><div><dt>Average</dt><dd>{card.average ?? "—"}</dd></div><div><dt>Subjects graded</dt><dd>{card.gradedSubjects}</dd></div></dl>
      <footer>Published {date(report.publishedAt)}{report.revision > 1 ? ` · Revision ${report.revision}` : ""} · {card.policy.name}{card.policy.schoolApproved ? "" : " (placeholder until the school approves its grading policy)"}</footer>
    </article>; })
      : <div className="portal-empty"><h2>No published results yet</h2><p>Your report card will appear here once your class’s results have been approved and published.</p></div>}
  </PortalShell>;
}
