import Link from "next/link";
import type { ReactNode } from "react";
import { ExitIcon } from "@radix-ui/react-icons";
import { Brand } from "@/components/brand";
import { navigationFor, type Actor } from "@/lib/portal/actor";
import { signOutAction } from "@/app/portal/actions";

const roleLabels: Record<string, string> = { administrator: "Administrator", principal: "Principal", vp_admin: "VP Administration", publisher: "Publisher", director: "Director" };

export function PortalShell({ actor, current, title, description, children }: { actor: Actor; current: string; title: string; description?: string; children: ReactNode }) {
  const labels = [...actor.roles.map(role => roleLabels[role]), ...(actor.classTeacherOf.length ? ["Class teacher"] : []), ...(actor.teachesSubjects ? ["Subject teacher"] : []), ...(actor.kind === "student" ? ["Student"] : [])];
  return (
    <div className="portal-app">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="portal-topbar">
        <Link href="/" aria-label="Brainfield Schools Lagos public website" className="portal-brand"><Brand /></Link>
        <div className="portal-user">
          <div><strong>{actor.name}</strong><span>{labels.join(" · ") || "No school role assigned"}</span></div>
          <form action={signOutAction}><button type="submit" className="portal-signout"><ExitIcon aria-hidden="true" />Sign out</button></form>
        </div>
      </header>
      <div className="portal-body">
        <nav className="portal-nav" aria-label="Portal">
          {navigationFor(actor).map(item => <Link key={item.href} href={item.href} aria-current={item.href === current ? "page" : undefined}>{item.label}</Link>)}
        </nav>
        <main id="main-content" className="portal-main">
          <div className="portal-page-heading">
            {actor.term && <span className="eyebrow">{actor.term.sessionName} · {actor.term.name}</span>}
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
