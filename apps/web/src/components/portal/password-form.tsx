"use client";

import { useActionState } from "react";
import Link from "next/link";
import { changePasswordAction, type PasswordState } from "@/app/portal/actions";

export function PasswordForm({ required }: { required: boolean }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  // `required` turns false as soon as the change is recorded, so the way on must not depend on it.
  if (state.ok) return <p className="form-success" role="status">Your password has been changed. You stay signed in here, and any other devices have been signed out. <Link href="/portal">Continue to the portal</Link>.</p>;
  return (
    <form action={action} className="stacked-form password-form" aria-label="Change password">
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      <div><label htmlFor="current-password">{required ? "Temporary password from the school" : "Current password"}</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required maxLength={256} /></div>
      <div><label htmlFor="new-password">New password</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={10} maxLength={128} aria-describedby="new-password-hint" /><p id="new-password-hint" className="form-hint">At least 10 characters. A short phrase you will remember is easiest. Don’t reuse a password from another site.</p></div>
      <div><label htmlFor="confirm-password">Type the new password again</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={10} maxLength={128} /></div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <button type="submit" className="button button-green" disabled={pending}>{pending ? "Changing…" : "Change password"}</button>
    </form>
  );
}
