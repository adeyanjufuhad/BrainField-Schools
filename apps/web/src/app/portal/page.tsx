import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { Brand } from "@/components/brand";
import { PortalShell } from "@/components/portal/portal-shell";
import { SignInForm } from "@/components/portal/sign-in-form";
import { canOverseeClasses, canViewDirectorDashboard, getSessionState, hasRole } from "@/lib/portal/actor";
import { overviewCounts } from "@/lib/portal/queries";
import { signOutAction } from "./actions";

export const metadata: Metadata = { title: "School portal" };

function Gate({ children }: { children: React.ReactNode }) {
  return <main id="main-content" className="portal-page"><Link href="/" aria-label="Brainfield Schools Lagos home"><Brand /></Link>{children}</main>;
}

export default async function Portal() {
  const state = await getSessionState();
  if (state.status === "unconfigured") return <Gate><span className="eyebrow">The next chapter</span><h1>Your school,<br /><em>connected.</em></h1><p>We’re preparing a dedicated space for students, teachers, and school leadership. The school will provide account access when the portal is ready.</p><Link href="/" className="button button-green"><ArrowLeftIcon />Back to the school website</Link><span className="portal-status">Portal access is not available yet.</span></Gate>;
  if (state.status === "signed-out") return <Gate><span className="eyebrow">School portal</span><h1>Sign in</h1><p>For Brainfield students, teachers and school leadership.</p><SignInForm /><Link href="/" className="text-link"><ArrowLeftIcon />Back to the school website</Link></Gate>;
  if (state.status !== "ready") return <Gate><span className="eyebrow">School portal</span><h1>Account not ready</h1><p>{state.status === "inactive" ? "This account has been deactivated by the school." : "You’re signed in, but this account hasn’t been linked to a school profile yet."} Contact the school office to get access. Signing up does not give access to school records.</p><form action={signOutAction}><button type="submit" className="button button-green">Sign out</button></form></Gate>;

  const { actor } = state;
  const counts = await overviewCounts(actor);
  const cards: { href: string; title: string; detail: string; count?: number }[] = [];
  if (actor.teachesSubjects) cards.push({ href: "/portal/teaching", title: "My score sheets", count: counts.toComplete, detail: counts.returned ? `${counts.returned} returned for correction` : "Sheets in draft or returned" });
  if (actor.classTeacherOf.length || hasRole(actor, "vp_admin")) cards.push({ href: "/portal/classes", title: "Sheets to review", count: counts.awaitingReview, detail: hasRole(actor, "vp_admin") ? "Including class teachers’ own subjects" : "Submitted by subject teachers" });
  if (hasRole(actor, "vp_admin")) cards.push({ href: "/portal/classes", title: "Awaiting final approval", count: counts.forVp, detail: "Class-approved results" });
  if (hasRole(actor, "publisher")) cards.push({ href: "/portal/classes", title: "Ready to publish", count: counts.forPublication, detail: "VP-approved results" });
  else if (canOverseeClasses(actor)) cards.push({ href: "/portal/classes", title: "Class results", detail: "Progress for every class" });
  if (actor.kind === "student") cards.push({ href: "/portal/results", title: "My results", count: counts.publishedResults, detail: "Published report cards" });
  if (canViewDirectorDashboard(actor)) cards.push({ href: "/portal/director", title: "Director dashboard", detail: "Published results and statistics" });

  return <PortalShell actor={actor} current="/portal" title={`Welcome, ${actor.name}`} description="Here’s what needs your attention this term.">
    {cards.length ? <ul className="portal-cards">{cards.map(card => <li key={card.title}><Link href={card.href}><span>{card.title}</span>{card.count !== undefined && <strong>{card.count}</strong>}<small>{card.detail}</small><ArrowRightIcon aria-hidden="true" /></Link></li>)}</ul>
      : <div className="portal-empty"><h2>No workspaces yet</h2><p>Your account is active, but no class, subject or role has been assigned for this term. Contact the school office.</p></div>}
  </PortalShell>;
}
