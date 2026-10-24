"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { classApproveAction, publishAction, reviewSheetAction, vpDecisionAction, type ActionResult } from "@/app/portal/actions";

function useWorkflow() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const run = (call: () => Promise<ActionResult>) => startTransition(async () => {
    setNotice(null);
    const result = await call();
    setNotice(result.ok ? { kind: "success", text: result.message } : { kind: "error", text: result.error });
    if (result.ok) router.refresh();
  });
  const message = notice && <p className={notice.kind === "error" ? "form-error" : "form-success"} role={notice.kind === "error" ? "alert" : "status"}>{notice.text}</p>;
  return { pending, run, message };
}

/** Accept, or return with a written reason. Used by class teachers and the VP. */
export function SheetReview({ sheetId, version, canAccept }: { sheetId: string; version: number; canAccept: boolean }) {
  const { pending, run, message } = useWorkflow();
  const [reason, setReason] = useState("");
  const [returning, setReturning] = useState(false);
  return <div className="workflow-panel">
    <h2>Your review</h2>
    <p>Check the scores against the teacher’s records. Reviewers cannot change marks: return the sheet with a reason and the teacher corrects it.</p>
    {!returning ? <div className="workflow-buttons">
      {canAccept && <button type="button" className="button button-green" disabled={pending} onClick={() => run(() => reviewSheetAction(sheetId, version, true, ""))}>{pending ? "Saving…" : "Accept sheet"}</button>}
      <button type="button" className="button button-outline" disabled={pending} onClick={() => setReturning(true)}>Return for correction</button>
    </div> : <div className="return-form">
      <label htmlFor="return-reason">What needs correcting?</label>
      <textarea id="return-reason" rows={3} value={reason} maxLength={1000} onChange={event => setReason(event.target.value)} aria-describedby="return-hint" />
      <p id="return-hint" className="form-hint">The teacher sees this message. Name the student and the score where possible.</p>
      <div className="workflow-buttons"><button type="button" className="button button-red" disabled={pending || reason.trim().length < 5} onClick={() => run(() => reviewSheetAction(sheetId, version, false, reason))}>{pending ? "Returning…" : "Return sheet"}</button><button type="button" className="text-button" onClick={() => setReturning(false)}>Cancel</button></div>
    </div>}
    {message}
  </div>;
}

export function ClassApprove({ classId, batchId, version, ready }: { classId: string; batchId: string; version: number; ready: boolean }) {
  const { pending, run, message } = useWorkflow();
  const [confirming, setConfirming] = useState(false);
  return <div className="workflow-panel">
    <h2>Class approval</h2>
    <p>{ready ? "Every subject sheet has been accepted. Approving sends this class’s results to the VP (Administration)." : "Accept every subject sheet before approving the class."}</p>
    {!confirming ? <button type="button" className="button button-green" disabled={!ready || pending} onClick={() => setConfirming(true)}>Approve class results</button>
      : <div className="workflow-buttons"><button type="button" className="button button-red" disabled={pending} onClick={() => run(() => classApproveAction(classId, batchId, version))}>{pending ? "Approving…" : "Yes, send to the VP"}</button><button type="button" className="text-button" onClick={() => setConfirming(false)}>Cancel</button></div>}
    {message}
  </div>;
}

export function VpDecision({ classId, batchId, version, canApprove, note }: { classId: string; batchId: string; version: number; canApprove: boolean; note?: string }) {
  const { pending, run, message } = useWorkflow();
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"idle" | "approve" | "return">("idle");
  return <div className="workflow-panel">
    <h2>Final approval</h2>
    <p>{note ?? "Approve to make these results ready for publication, or return them to the class teacher with a reason. Approval does not publish."}</p>
    {mode === "idle" && <div className="workflow-buttons">
      {canApprove && <button type="button" className="button button-green" disabled={pending} onClick={() => setMode("approve")}>Give final approval</button>}
      <button type="button" className="button button-outline" disabled={pending} onClick={() => setMode("return")}>Return to class teacher</button>
    </div>}
    {mode === "approve" && <div className="workflow-buttons"><button type="button" className="button button-red" disabled={pending} onClick={() => run(() => vpDecisionAction(classId, batchId, version, true, ""))}>{pending ? "Approving…" : "Yes, approve"}</button><button type="button" className="text-button" onClick={() => setMode("idle")}>Cancel</button></div>}
    {mode === "return" && <div className="return-form">
      <label htmlFor="vp-reason">What needs attention?</label>
      <textarea id="vp-reason" rows={3} value={reason} maxLength={1000} onChange={event => setReason(event.target.value)} />
      <div className="workflow-buttons"><button type="button" className="button button-red" disabled={pending || reason.trim().length < 5} onClick={() => run(() => vpDecisionAction(classId, batchId, version, false, reason))}>{pending ? "Returning…" : "Return results"}</button><button type="button" className="text-button" onClick={() => setMode("idle")}>Cancel</button></div>
    </div>}
    {message}
  </div>;
}

export function PublishResults({ classId, batchId, version }: { classId: string; batchId: string; version: number }) {
  const { pending, run, message } = useWorkflow();
  const [confirming, setConfirming] = useState(false);
  return <div className="workflow-panel">
    <h2>Publish results</h2>
    <p>Publishing freezes each student’s report card and makes it visible to them. Corrections after publication need a new approved revision.</p>
    {!confirming ? <button type="button" className="button button-green" disabled={pending} onClick={() => setConfirming(true)}>Publish to students</button>
      : <div className="workflow-buttons"><button type="button" className="button button-red" disabled={pending} onClick={() => run(() => publishAction(classId, batchId, version))}>{pending ? "Publishing…" : "Yes, publish now"}</button><button type="button" className="text-button" onClick={() => setConfirming(false)}>Cancel</button></div>}
    {message}
  </div>;
}
