import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { PasswordForm } from "@/components/portal/password-form";
import { getSessionState } from "@/lib/portal/actor";

export const metadata: Metadata = { title: "Account" };

// The only portal page open while a temporary password is still in use.
export default async function Account() {
  const state = await getSessionState();
  if (state.status !== "ready") redirect("/portal");
  const { actor } = state;
  return <PortalShell actor={actor} current="/portal/account" title={actor.passwordChangeRequired ? "Choose your own password" : "Account"}
    description={actor.passwordChangeRequired ? "You signed in with a temporary password from the school. Choose a password only you know before continuing." : "Change the password you use to sign in to the portal."}>
    <section className="workflow-panel" aria-labelledby="password-title">
      <h2 id="password-title">Change password</h2>
      <PasswordForm required={actor.passwordChangeRequired} />
      <p className="form-hint">Forgotten your password? The school office can reset it and give you a new temporary one.</p>
    </section>
  </PortalShell>;
}
