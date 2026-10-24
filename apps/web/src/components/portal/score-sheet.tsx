"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { saveScoresAction, submitSheetAction } from "@/app/portal/actions";
import type { Policy } from "@/lib/portal/queries";
import { gradeFor } from "@/lib/portal/grading";

type Attendance = "present" | "absent" | "exempt";
type Student = { enrolmentId: string; name: string; admissionNumber: string; ca: number | null; exam: number | null; attendance: Attendance };
type Row = { enrolmentId: string; ca: string; exam: string; attendance: Attendance };

const toRow = (student: Student): Row => ({ enrolmentId: student.enrolmentId, ca: student.ca?.toString() ?? "", exam: student.exam?.toString() ?? "", attendance: student.attendance });
const scorePattern = /^\d{1,3}(\.\d{1,2})?$/;

function cellError(value: string, max: number) {
  if (value === "") return null;
  if (!scorePattern.test(value)) return "Use a number with up to 2 decimal places.";
  if (Number(value) > max) return `Must be ${max} or less.`;
  return null;
}

export function ScoreSheet({ sheetId, initialVersion, students, policy, editable }: { sheetId: string; initialVersion: number; students: Student[]; policy: Policy; editable: boolean }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => students.map(toRow));
  const [saved, setSaved] = useState<Row[]>(() => students.map(toRow));
  const [version, setVersion] = useState(initialVersion);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const table = useRef<HTMLTableElement>(null);

  const dirty = useMemo(() => JSON.stringify(rows) !== JSON.stringify(saved), [rows, saved]);
  const errors = rows.map(row => ({ ca: row.attendance === "present" ? cellError(row.ca, policy.caMax) : null, exam: row.attendance === "present" ? cellError(row.exam, policy.examMax) : null }));
  const invalid = errors.some(error => error.ca || error.exam);
  const complete = rows.every(row => row.attendance !== "present" || (row.ca !== "" && row.exam !== ""));

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (index: number, patch: Partial<Row>) => setRows(current => current.map((row, position) => position === index ? { ...row, ...patch } : row));

  const move = (event: KeyboardEvent<HTMLElement>, index: number, column: string) => {
    const offset = event.key === "ArrowDown" || event.key === "Enter" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (!offset) return;
    const next = table.current?.querySelector<HTMLElement>(`[data-row="${index + offset}"][data-column="${column}"]`);
    if (next) { event.preventDefault(); next.focus(); }
  };

  const save = () => startTransition(async () => {
    setNotice(null);
    const payload = rows.map(row => ({ enrolmentId: row.enrolmentId, attendance: row.attendance, ca: row.attendance === "present" && row.ca !== "" ? Number(row.ca) : null, exam: row.attendance === "present" && row.exam !== "" ? Number(row.exam) : null }));
    const result = await saveScoresAction(sheetId, version, payload);
    if (!result.ok) return setNotice({ kind: "error", text: result.error });
    setVersion(result.version);
    setSaved(rows);
    setNotice({ kind: "success", text: `Saved at ${new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}.` });
  });

  const submit = () => startTransition(async () => {
    const result = await submitSheetAction(sheetId, version);
    setConfirming(false);
    if (!result.ok) return setNotice({ kind: "error", text: result.error });
    setNotice({ kind: "success", text: result.message });
    router.refresh();
  });

  return (
    <div className="score-sheet">
      <div className="table-scroll">
        <table ref={table} className="data-table score-table">
          <caption className="sr-only">Scores. CA out of {policy.caMax}, exam out of {policy.examMax}.</caption>
          <thead><tr><th scope="col">Student</th><th scope="col">Attendance</th><th scope="col">CA <span>/ {policy.caMax}</span></th><th scope="col">Exam <span>/ {policy.examMax}</span></th><th scope="col">Total</th><th scope="col">Grade</th></tr></thead>
          <tbody>
            {rows.map((row, index) => {
              const student = students[index];
              const present = row.attendance === "present";
              const total = present && row.ca !== "" && row.exam !== "" && !errors[index].ca && !errors[index].exam ? Math.round((Number(row.ca) + Number(row.exam)) * 100) / 100 : null;
              return <tr key={row.enrolmentId}>
                <th scope="row"><span className="student-name">{student.name}</span><span className="student-id">{student.admissionNumber}</span></th>
                <td>{editable ? <select aria-label={`Attendance for ${student.name}`} value={row.attendance} data-row={index} data-column="attendance" onKeyDown={event => move(event, index, "attendance")} onChange={event => update(index, { attendance: event.target.value as Attendance })}><option value="present">Present</option><option value="absent">Absent</option><option value="exempt">Exempt</option></select> : <span className="attendance-text">{row.attendance}</span>}</td>
                {(["ca", "exam"] as const).map(column => <td key={column}>
                  {editable ? <>
                    <input aria-label={`${column === "ca" ? "CA" : "Exam"} score for ${student.name}`} inputMode="decimal" autoComplete="off" value={present ? row[column] : ""} disabled={!present} placeholder={present ? "" : "—"}
                      aria-invalid={errors[index][column] ? true : undefined} aria-describedby={errors[index][column] ? `${row.enrolmentId}-${column}-error` : undefined}
                      data-row={index} data-column={column} onKeyDown={event => move(event, index, column)} onChange={event => update(index, { [column]: event.target.value.trim() })} />
                    {errors[index][column] && <span id={`${row.enrolmentId}-${column}-error`} className="cell-error">{errors[index][column]}</span>}
                  </> : <span>{present ? row[column] || "—" : "—"}</span>}
                </td>)}
                <td className="numeric">{present ? total ?? "—" : <span className="attendance-text">{row.attendance}</span>}</td>
                <td className="numeric">{gradeFor(total, policy) ?? "—"}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {editable && <div className="sheet-actions">
        <div className="sheet-state" aria-live="polite">
          {notice ? <span className={notice.kind === "error" ? "form-error" : "form-success"} role={notice.kind === "error" ? "alert" : undefined}>{notice.text}</span>
            : <span>{dirty ? "You have unsaved changes." : "All changes saved."}</span>}
        </div>
        <button type="button" className="button button-green" onClick={save} disabled={pending || !dirty || invalid}>{pending && !confirming ? "Saving…" : "Save scores"}</button>
        {!confirming ? <button type="button" className="button button-outline" onClick={() => setConfirming(true)} disabled={pending || dirty || invalid || !complete}
          title={dirty ? "Save your changes first" : !complete ? "Every student needs both scores, or absent/exempt" : undefined}>Submit for review</button>
          : <div className="confirm-panel" role="group" aria-label="Confirm submission"><p>Submitting locks this sheet. You can only edit it again if a reviewer returns it.</p><button type="button" className="button button-red" onClick={submit} disabled={pending}>{pending ? "Submitting…" : "Yes, submit"}</button><button type="button" className="text-button" onClick={() => setConfirming(false)}>Cancel</button></div>}
        {!complete && !dirty && <p className="form-hint">To submit, give every student both scores, or mark them absent or exempt.</p>}
      </div>}
    </div>
  );
}
