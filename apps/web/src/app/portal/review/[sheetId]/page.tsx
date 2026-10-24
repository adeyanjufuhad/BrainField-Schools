import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { PortalShell } from "@/components/portal/portal-shell";
import { ScoreSheet } from "@/components/portal/score-sheet";
import { StatusBadge } from "@/components/portal/status-badge";
import { WorkflowHistory } from "@/components/portal/sheet-history";
import { SheetReview } from "@/components/portal/workflow-actions";
import { requireActor } from "@/lib/portal/actor";
import { sheetDetail } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Review score sheet" };

export default async function ReviewSheet({ params }: { params: Promise<{ sheetId: string }> }) {
  const actor = await requireActor();
  const sheet = await sheetDetail(actor, (await params).sheetId);
  if (!sheet || sheet.isTeacher) notFound();
  const reviewable = sheet.canReview && ["submitted", "accepted"].includes(sheet.status);
  return <PortalShell actor={actor} current="/portal/classes" title={`Review · ${sheet.subjectName}`} description={`${sheet.className} · entered by ${sheet.teacherName}`}>
    <Link href={`/portal/classes/${sheet.classId}`} className="back-link"><ArrowLeftIcon aria-hidden="true" />Back to {sheet.className}</Link>
    <div className="sheet-summary"><StatusBadge status={sheet.status} /><span>Revision {sheet.revision}</span><span>{sheet.policy.name}</span></div>
    {sheet.ownSheetOfClassTeacher && <div className="callout" role="note"><strong>Independent review</strong><p>This is the class teacher’s own subject, so the VP (Administration) reviews it.</p></div>}
    {sheet.status === "draft" && <div className="callout" role="note"><strong>Not submitted yet</strong><p>The subject teacher is still entering scores.</p></div>}
    <ScoreSheet sheetId={sheet.id} initialVersion={sheet.version} students={sheet.students} policy={sheet.policy} editable={false} />
    {reviewable && <SheetReview sheetId={sheet.id} version={sheet.version} canAccept={sheet.status === "submitted"} />}
    {!sheet.canReview && ["submitted", "accepted"].includes(sheet.status) && <p className="form-hint">You can view this sheet but not review it.</p>}
    <WorkflowHistory events={sheet.history} />
  </PortalShell>;
}
