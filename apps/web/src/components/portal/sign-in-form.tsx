"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/portal/actions";

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAction, {});
  return (
    <form action={action} className="auth-form" noValidate>
      <div><label htmlFor="email">Email address or admission number</label><input id="email" name="email" type="text" inputMode="email" autoCapitalize="none" spellCheck={false} autoComplete="username" required defaultValue={state.email} aria-describedby={state.error ? "sign-in-error email-hint" : "email-hint"} /><p id="email-hint" className="form-hint">Students without an email address use the admission number the school gave them.</p></div>
      <div><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      {state.error && <p id="sign-in-error" className="form-error" role="alert">{state.error}</p>}
      <button type="submit" className="button button-green" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <p className="form-hint">Accounts are created by the school. Contact the school office if you need access or forgot your password.</p>
    </form>
  );
}
