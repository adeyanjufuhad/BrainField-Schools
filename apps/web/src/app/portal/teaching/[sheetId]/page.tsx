import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { PortalShell } from "@/components/portal/portal-shell";
import { ScoreSheet } from "@/components/portal/score-sheet";
import { StatusBadge } from "@/components/portal/status-badge";
import { WorkflowHistory } from "@/components/portal/sheet-history";
import { requireActor } from "@/lib/portal/actor";
import { sheetDetail } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Score sheet" };

export default async function TeachingSheet({ params }: { params: Promise<{ sheetId: string }> }) {
  const actor = await requireActor();
  const sheet = await sheetDetail(actor, (await params).sheetId);
  if (!sheet || !sheet.isTeacher) notFound();
  return <PortalShell actor={actor} current="/portal/teaching" title={`${sheet.subjectName} · ${sheet.className}`}>
    <Link href="/portal/teaching" className="back-link"><ArrowLeftIcon aria-hidden="true" />All score sheets</Link>
    <div className="sheet-summary">
      <StatusBadge status={sheet.status} /><span>Revision {sheet.revision}</span>
      <span>{sheet.policy.name}: CA out of {sheet.policy.caMax}, exam out of {sheet.policy.examMax}</span>
    </div>
    {sheet.status === "returned" && sheet.returnReason && <div className="callout callout-attention" role="note"><strong>Returned for correction</strong><p>“{sheet.returnReason}”</p><p>Correct the scores, save, and submit again.</p></div>}
    {sheet.status === "submitted" && <div className="callout" role="note"><strong>Waiting for review</strong><p>This sheet is locked while the class teacher (or the VP, for a class teacher’s own subject) reviews it.</p></div>}
    {sheet.status === "accepted" && <div className="callout" role="note"><strong>Accepted</strong><p>This sheet is locked. It can only change if a reviewer returns it.</p></div>}
    <ScoreSheet key={`${sheet.status}-${sheet.revision}`} sheetId={sheet.id} initialVersion={sheet.version} students={sheet.students} policy={sheet.policy} editable={sheet.canEdit} />
    <WorkflowHistory events={sheet.history} />
  </PortalShell>;
}
