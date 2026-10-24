import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { PortalShell } from "@/components/portal/portal-shell";
import { StatusBadge } from "@/components/portal/status-badge";
import { WorkflowHistory } from "@/components/portal/sheet-history";
import { ClassApprove, PublishResults, VpDecision } from "@/components/portal/workflow-actions";
import { requireActor } from "@/lib/portal/actor";
import { gradeFor } from "@/lib/portal/grading";
import { classDetail } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Class results" };

export default async function ClassResults({ params }: { params: Promise<{ classId: string }> }) {
  const actor = await requireActor();
  const klass = await classDetail(actor, (await params).classId);
  if (!klass) notFound();
  const allAccepted = klass.sheets.length > 0 && klass.sheets.every(sheet => sheet.status === "accepted");
  return <PortalShell actor={actor} current="/portal/classes" title={klass.name} description={`Class teacher: ${klass.classTeacherName ?? "not assigned"}`}>
    <Link href="/portal/classes" className="back-link"><ArrowLeftIcon aria-hidden="true" />All classes</Link>
    <div className="sheet-summary"><StatusBadge status={klass.status} /><span>{klass.policy.name}</span></div>
    {klass.status === "returned" && klass.returnReason && <div className="callout callout-attention" role="note"><strong>Returned by the VP</strong><p>“{klass.returnReason}”</p><p>Return any affected subject sheets to their teachers, then approve the class again.</p></div>}
    {!klass.policy.schoolApproved && <div className="callout" role="note"><strong>Example grading policy</strong><p>Grades use a placeholder policy until the school approves its own weights and grade bands.</p></div>}

    <section aria-labelledby="sheets-title" className="portal-section">
      <h2 id="sheets-title">Subject sheets</h2>
      <div className="table-scroll"><table className="data-table">
        <thead><tr><th scope="col">Subject</th><th scope="col">Teacher</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
        <tbody>{klass.sheets.map(sheet => <tr key={sheet.id}>
          <th scope="row">{sheet.subjectName}</th><td>{sheet.teacherName}{sheet.ownSheet ? " (you)" : ""}</td><td><StatusBadge status={sheet.status} /></td>
          <td className="row-link"><Link href={sheet.ownSheet ? `/portal/teaching/${sheet.id}` : `/portal/review/${sheet.id}`}>{sheet.status === "submitted" && !sheet.ownSheet ? "Review" : "View"} <ArrowRightIcon aria-hidden="true" /><span className="sr-only"> {sheet.subjectName}</span></Link></td>
        </tr>)}</tbody>
      </table></div>
    </section>

    <section aria-labelledby="compiled-title" className="portal-section">
      <h2 id="compiled-title">Compiled totals</h2>
      <div className="table-scroll"><table className="data-table compiled-table">
        <caption className="sr-only">Each student’s total and grade per subject</caption>
        <thead><tr><th scope="col">Student</th>{klass.sheets.map(sheet => <th scope="col" key={sheet.id}>{sheet.subjectName}</th>)}</tr></thead>
        <tbody>{klass.students.map(student => <tr key={student.enrolmentId}>
          <th scope="row"><span className="student-name">{student.name}</span><span className="student-id">{student.admissionNumber}</span></th>
          {klass.sheets.map(sheet => { const value = student.totals[sheet.id]; return <td key={sheet.id} className="numeric">{typeof value === "number" ? <>{value} <span className="grade-chip">{gradeFor(value, klass.policy)}</span></> : value ?? "—"}</td>; })}
        </tr>)}</tbody>
      </table></div>
    </section>

    {klass.canClassApprove && klass.batchId && <ClassApprove classId={klass.id} batchId={klass.batchId} version={klass.version} ready={allAccepted} />}
    {klass.canVpDecide && klass.batchId && <VpDecision classId={klass.id} batchId={klass.batchId} version={klass.version} canApprove={klass.status === "class_approved" && !klass.vpIsClassTeacher}
      note={klass.vpIsClassTeacher ? "You are this class’s class teacher, so another VP must give final approval. You can still return the results." : klass.status === "vp_approved" ? "You have approved these results. You can still return them before they are published." : undefined} />}
    {klass.canPublish && klass.batchId && <PublishResults classId={klass.id} batchId={klass.batchId} version={klass.version} />}
    {klass.status === "published" && <div className="callout" role="note"><strong>Published</strong><p>Students in this class can now see their report cards.</p></div>}
    <WorkflowHistory events={klass.history} title="Class history" />
  </PortalShell>;
}
