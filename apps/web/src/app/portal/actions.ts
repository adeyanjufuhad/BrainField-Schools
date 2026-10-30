"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getNeonAuth } from "@/lib/auth/server";
import { getDatabase, runWorkflow, WorkflowError } from "@/lib/db/neon";
import { getSessionState } from "@/lib/portal/actor";
import { loginEmailFor } from "@/lib/portal/accounts";

export type ActionResult = { ok: true; version: number; message: string } | { ok: false; error: string };
export type SignInState = { error?: string; email?: string };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function signInAction(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const auth = getNeonAuth();
  if (!auth) return { error: "School sign-in is not available yet." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "").slice(0, 256);
  if (!email || !password) return { error: "Enter your email address or admission number, and your password.", email };
  const { error } = await auth.signIn.email({ email: loginEmailFor(email), password });
  if (error) {
    if (error.status === 429) return { error: "Too many sign-in attempts. Wait a minute, then try again.", email };
    if (error.status !== 401) console.error("Sign-in failed", error.status, error.code);
    return { error: "Those sign-in details don’t match a school account. Check them and try again.", email };
  }
  redirect("/portal");
}

export async function signOutAction() {
  await getNeonAuth()?.signOut();
  redirect("/portal");
}

async function transition(label: string, paths: string[], call: (actorId: string) => Promise<number>): Promise<ActionResult> {
  const state = await getSessionState();
  if (state.status !== "ready") return { ok: false, error: "Your session has ended. Sign in again to continue." };
  try {
    const version = await runWorkflow(() => call(state.actor.profileId));
    for (const path of ["/portal", ...paths]) revalidatePath(path);
    return { ok: true, version, message: label };
  } catch (error) {
    return { ok: false, error: error instanceof WorkflowError ? error.message : "Something went wrong. Please try again." };
  }
}

const versionOf = (rows: Record<string, unknown>[]) => Number(Object.values(rows[0] ?? {})[0]);

type ScoreRow = { enrolmentId: string; ca: number | null; exam: number | null; attendance: "present" | "absent" | "exempt" };

function cleanRows(rows: unknown): ScoreRow[] | null {
  if (!Array.isArray(rows) || rows.length > 500) return null;
  const clean: ScoreRow[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") return null;
    const { enrolmentId, ca, exam, attendance } = row as Record<string, unknown>;
    if (typeof enrolmentId !== "string" || !uuid.test(enrolmentId)) return null;
    if (!["present", "absent", "exempt"].includes(String(attendance))) return null;
    const score = (value: unknown) => value === null || value === undefined || value === "" ? null : typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) / 100 : NaN;
    const cleanCa = score(ca), cleanExam = score(exam);
    if (Number.isNaN(cleanCa) || Number.isNaN(cleanExam)) return null;
    clean.push({ enrolmentId, ca: cleanCa, exam: cleanExam, attendance: attendance as ScoreRow["attendance"] });
  }
  return clean;
}

export async function saveScoresAction(sheetId: string, version: number, rows: unknown): Promise<ActionResult> {
  const clean = cleanRows(rows);
  if (!uuid.test(sheetId) || !Number.isInteger(version) || !clean) return { ok: false, error: "Those scores could not be read. Check each entry is a number." };
  return transition("Scores saved.", [`/portal/teaching/${sheetId}`, "/portal/teaching"], async actorId =>
    versionOf(await getDatabase()`select app.save_scores(${actorId}, ${sheetId}, ${version}, ${JSON.stringify(clean)}::jsonb)`));
}

export async function submitSheetAction(sheetId: string, version: number): Promise<ActionResult> {
  if (!uuid.test(sheetId) || !Number.isInteger(version)) return { ok: false, error: "This sheet could not be found." };
  return transition("Sheet submitted to the class teacher.", [`/portal/teaching/${sheetId}`, "/portal/teaching", "/portal/classes"], async actorId =>
    versionOf(await getDatabase()`select app.submit_sheet(${actorId}, ${sheetId}, ${version})`));
}

export async function reviewSheetAction(sheetId: string, version: number, accept: boolean, reason: string): Promise<ActionResult> {
  if (!uuid.test(sheetId) || !Number.isInteger(version)) return { ok: false, error: "This sheet could not be found." };
  return transition(accept ? "Sheet accepted." : "Sheet returned to the teacher.", [`/portal/review/${sheetId}`, "/portal/classes"], async actorId =>
    versionOf(await getDatabase()`select app.review_sheet(${actorId}, ${sheetId}, ${version}, ${accept}, ${reason.slice(0, 1000)})`));
}

export async function classApproveAction(classId: string, batchId: string, version: number): Promise<ActionResult> {
  if (!uuid.test(batchId) || !uuid.test(classId) || !Number.isInteger(version)) return { ok: false, error: "These class results could not be found." };
  return transition("Class results approved and sent to the VP.", [`/portal/classes/${classId}`, "/portal/classes"], async actorId =>
    versionOf(await getDatabase()`select app.class_approve(${actorId}, ${batchId}, ${version})`));
}

export async function vpDecisionAction(classId: string, batchId: string, version: number, approve: boolean, reason: string): Promise<ActionResult> {
  if (!uuid.test(batchId) || !uuid.test(classId) || !Number.isInteger(version)) return { ok: false, error: "These class results could not be found." };
  return transition(approve ? "Final approval given. Results are ready to publish." : "Results returned to the class teacher.", [`/portal/classes/${classId}`, "/portal/classes"], async actorId =>
    versionOf(await getDatabase()`select app.vp_decide(${actorId}, ${batchId}, ${version}, ${approve}, ${reason.slice(0, 1000)})`));
}

export async function publishAction(classId: string, batchId: string, version: number): Promise<ActionResult> {
  if (!uuid.test(batchId) || !uuid.test(classId) || !Number.isInteger(version)) return { ok: false, error: "These class results could not be found." };
  return transition("Results published. Students can now see their reports.", [`/portal/classes/${classId}`, "/portal/classes", "/portal/director", "/portal/results"], async actorId =>
    versionOf(await getDatabase()`select app.publish_batch(${actorId}, ${batchId}, ${version})`));
}
