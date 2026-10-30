"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon } from "@radix-ui/react-icons";
import {
  addStaffAction, addStudentAction, createClassAction, createLoginAction, createSubjectAction, enrolAction,
  setActiveAction, setClassTeacherAction, setRoleAction, setSubjectTeacherAction, type AdminResult, type Credentials,
} from "@/app/portal/admin/actions";

const roleLabels = { administrator: "Administrator", principal: "Principal", vp_admin: "VP Administration", publisher: "Publisher", director: "Director" } as const;
type RoleKey = keyof typeof roleLabels;

function Notice({ result }: { result: AdminResult | null }) {
  if (!result) return null;
  return <p className={result.ok ? "form-success" : "form-error"} role={result.ok ? "status" : "alert"}>{result.ok ? result.message : result.error}</p>;
}

/** Shown once, straight after creation. The password is never stored or shown again. */
export function CredentialsNotice({ credentials }: { credentials: Credentials }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(`Login: ${credentials.login}\nTemporary password: ${credentials.password}`); setCopied(true); } catch { setCopied(false); }
  };
  return <div className="credentials" role="region" aria-label={`Sign-in details for ${credentials.name}`}>
    <strong>Sign-in details for {credentials.name}</strong>
    <dl><div><dt>Login</dt><dd>{credentials.login}</dd></div><div><dt>Temporary password</dt><dd className="credential-password">{credentials.password}</dd></div></dl>
    <p>Copy these now and hand them over in person. The password will not be shown again.</p>
    <button type="button" className="button button-outline button-small" onClick={copy}><CopyIcon aria-hidden="true" />{copied ? "Copied" : "Copy details"}</button>
  </div>;
}

function useAdmin() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminResult | null>(null);
  const run = (call: () => Promise<AdminResult>, onSuccess?: () => void) => startTransition(async () => {
    const next = await call();
    setResult(next);
    if (next.ok) { onSuccess?.(); router.refresh(); }
  });
  return { pending, result, run };
}

/** Submits through a server action but keeps what was typed when the action fails. */
function useAdminForm(action: (previous: AdminResult | null, formData: FormData) => Promise<AdminResult>) {
  const { pending, result, run } = useAdmin();
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    run(() => action(null, data), () => form.reset());
  };
  return { pending, result, onSubmit };
}

function NameForm({ action, label, placeholder, button }: { action: typeof createClassAction; label: string; placeholder: string; button: string }) {
  const { pending, result, onSubmit } = useAdminForm(action);
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return <form onSubmit={onSubmit} className="inline-form">
    <div><label htmlFor={id}>{label}</label><input id={id} name="name" required maxLength={60} placeholder={placeholder} /></div>
    <button type="submit" className="button button-green button-small" disabled={pending}>{pending ? "Adding…" : button}</button>
    <Notice result={result} />
  </form>;
}

export const AddClassForm = () => <NameForm action={createClassAction} label="New class name" placeholder="e.g. JSS 2 A" button="Add class" />;
export const AddSubjectForm = () => <NameForm action={createSubjectAction} label="New subject name" placeholder="e.g. Biology" button="Add subject" />;

export function TeacherSelect({ label, teachers, current, classId, subjectId }: { label: string; teachers: { id: string; name: string }[]; current: string | null; classId: string; subjectId?: string }) {
  const { pending, result, run } = useAdmin();
  const [value, setValue] = useState(current ?? "");
  return <div className="assign-control">
    <select aria-label={label} value={value} onChange={event => setValue(event.target.value)}>
      <option value="">Not assigned</option>
      {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
    </select>
    <button type="button" className="button button-outline button-small" disabled={pending || !value || value === current}
      onClick={() => run(() => subjectId ? setSubjectTeacherAction(classId, subjectId, value) : setClassTeacherAction(classId, value))}>{pending ? "Saving…" : "Save"}</button>
    <Notice result={result} />
  </div>;
}

export function AddStaffForm() {
  const { pending, result, onSubmit } = useAdminForm(addStaffAction);
  return <form onSubmit={onSubmit} className="stacked-form" aria-label="Add a staff member">
    <div className="form-row">
      <div><label htmlFor="staff-name">Full name</label><input id="staff-name" name="name" required maxLength={120} autoComplete="off" /></div>
      <div><label htmlFor="staff-email">Email address for sign-in</label><input id="staff-email" name="email" type="email" required maxLength={254} autoComplete="off" /></div>
    </div>
    <fieldset><legend>School roles (optional)</legend><p className="form-hint">Teaching is assigned per class in School setup. Roles here are for leadership and administration.</p>
      <div className="checkbox-row">{(Object.keys(roleLabels) as RoleKey[]).map(role => <label key={role}><input type="checkbox" name="roles" value={role} />{roleLabels[role]}</label>)}</div>
    </fieldset>
    <button type="submit" className="button button-green" disabled={pending}>{pending ? "Adding…" : "Add staff member"}</button>
    {result?.ok && result.credentials ? <><Notice result={result} /><CredentialsNotice credentials={result.credentials} /></> : <Notice result={result} />}
  </form>;
}

export function AddStudentForm({ classes }: { classes: { id: string; name: string }[] }) {
  const { pending, result, onSubmit } = useAdminForm(addStudentAction);
  return <form onSubmit={onSubmit} className="stacked-form" aria-label="Add a student">
    <div className="form-row">
      <div><label htmlFor="student-name">Full name</label><input id="student-name" name="name" required maxLength={120} autoComplete="off" /></div>
      <div><label htmlFor="student-admission">Admission number</label><input id="student-admission" name="admission" required maxLength={32} autoComplete="off" /></div>
      <div><label htmlFor="student-class">Class this term</label><select id="student-class" name="classId" defaultValue=""><option value="">Not enrolled yet</option>{classes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
    </div>
    <label className="checkbox-label"><input type="checkbox" name="createLogin" defaultChecked />Create a portal sign-in (signs in with the admission number)</label>
    <button type="submit" className="button button-green" disabled={pending}>{pending ? "Adding…" : "Add student"}</button>
    {result?.ok && result.credentials ? <><Notice result={result} /><CredentialsNotice credentials={result.credentials} /></> : <Notice result={result} />}
  </form>;
}

type Person = { id: string; name: string; kind: "staff" | "student"; active: boolean; hasLogin: boolean; roles: string[]; classId: string | null; hasScores: boolean; isSelf: boolean };

export function PersonControls({ person, classes }: { person: Person; classes: { id: string; name: string }[] }) {
  const { pending, result, run } = useAdmin();
  const [loginEmail, setLoginEmail] = useState("");
  const [classId, setClassId] = useState(person.classId ?? "");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  return <div className="person-controls">
    {person.kind === "staff" && <fieldset className="role-toggles"><legend className="sr-only">Roles for {person.name}</legend>
      {(Object.keys(roleLabels) as RoleKey[]).map(role => <label key={role}><input type="checkbox" checked={person.roles.includes(role)} disabled={pending || (person.isSelf && role === "administrator")}
        onChange={event => run(() => setRoleAction(person.id, role, event.target.checked))} />{roleLabels[role]}</label>)}
    </fieldset>}
    {person.kind === "student" && <div className="assign-control">
      <select aria-label={`Class for ${person.name}`} value={classId} disabled={person.hasScores} onChange={event => setClassId(event.target.value)}>
        <option value="">Not enrolled</option>{classes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      {!person.hasScores && <button type="button" className="button button-outline button-small" disabled={pending || !classId || classId === person.classId} onClick={() => run(() => enrolAction(person.id, classId))}>Save class</button>}
    </div>}
    {!person.hasLogin && <div className="assign-control">
      {person.kind === "staff" && <input type="email" aria-label={`Sign-in email for ${person.name}`} placeholder="Email address" value={loginEmail} onChange={event => setLoginEmail(event.target.value)} />}
      <button type="button" className="button button-outline button-small" disabled={pending || (person.kind === "staff" && !loginEmail)} onClick={() => run(() => createLoginAction(person.id, loginEmail))}>Create sign-in</button>
    </div>}
    {!person.isSelf && (person.active
      ? !confirmDeactivate ? <button type="button" className="text-button" disabled={pending} onClick={() => setConfirmDeactivate(true)}>Remove access</button>
        : <span className="confirm-inline"><button type="button" className="button button-red button-small" disabled={pending} onClick={() => run(() => setActiveAction(person.id, false))}>Yes, remove access</button><button type="button" className="text-button" onClick={() => setConfirmDeactivate(false)}>Cancel</button></span>
      : <button type="button" className="button button-outline button-small" disabled={pending} onClick={() => run(() => setActiveAction(person.id, true))}>Restore access</button>)}
    {result?.ok && result.credentials ? <CredentialsNotice credentials={result.credentials} /> : <Notice result={result} />}
  </div>;
}
