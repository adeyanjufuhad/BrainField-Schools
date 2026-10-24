"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/portal/actions";

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAction, {});
  return (
    <form action={action} className="auth-form" noValidate>
      <div><label htmlFor="email">School email address</label><input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} aria-describedby={state.error ? "sign-in-error" : undefined} /></div>
      <div><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      {state.error && <p id="sign-in-error" className="form-error" role="alert">{state.error}</p>}
      <button type="submit" className="button button-green" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <p className="form-hint">Accounts are created by the school. Contact the school office if you need access or forgot your password.</p>
    </form>
  );
}
