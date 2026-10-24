import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getNeonAuth } from "@/lib/auth/server";
import { getDatabase, isDatabaseConfigured } from "@/lib/db/neon";

export type Role = "administrator" | "principal" | "vp_admin" | "publisher" | "director";

export type Actor = {
  profileId: string;
  name: string;
  kind: "staff" | "student";
  roles: Role[];
  term: { id: string; name: string; sessionName: string } | null;
  teachesSubjects: boolean;
  classTeacherOf: { classId: string; className: string }[];
};

export type SessionState =
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "unlinked"; email: string }
  | { status: "inactive"; email: string }
  | { status: "ready"; actor: Actor };

/** Resolves the signed-in Auth user to an active school profile. Auth alone grants no school access. */
export const getSessionState = cache(async (): Promise<SessionState> => {
  const auth = getNeonAuth();
  if (!auth || !isDatabaseConfigured()) return { status: "unconfigured" };
  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user?.id) return { status: "signed-out" };

  const sql = getDatabase();
  const [profile] = await sql`select id, full_name, kind, active from app.profiles where auth_user_id = ${user.id}`;
  if (!profile) return { status: "unlinked", email: user.email };
  if (!profile.active) return { status: "inactive", email: user.email };

  const [term] = await sql`
    select t.id, t.name, s.name as session_name from app.terms t join app.academic_sessions s on s.id = t.session_id
    where t.is_current limit 1`;
  const roles = await sql`select role from app.role_grants where profile_id = ${profile.id} and revoked_at is null`;
  const teaching = term ? await sql`select 1 from app.subject_offerings where teacher_id = ${profile.id} and term_id = ${term.id} limit 1` : [];
  const classes = term ? await sql`
    select c.id, c.name from app.class_teachers ct join app.classes c on c.id = ct.class_id
    where ct.teacher_id = ${profile.id} and ct.term_id = ${term.id} order by c.name` : [];

  return {
    status: "ready",
    actor: {
      profileId: profile.id,
      name: profile.full_name,
      kind: profile.kind,
      roles: roles.map(row => row.role as Role),
      term: term ? { id: term.id, name: term.name, sessionName: term.session_name } : null,
      teachesSubjects: teaching.length > 0,
      classTeacherOf: classes.map(row => ({ classId: row.id, className: row.name })),
    },
  };
});

export async function requireActor(): Promise<Actor> {
  const state = await getSessionState();
  if (state.status !== "ready") redirect("/portal");
  return state.actor;
}

export const hasRole = (actor: Actor, ...roles: Role[]) => roles.some(role => actor.roles.includes(role));

/** Who may open a class's compiled results: its class teacher, the VP, publishers and the principal. */
export const canOverseeClasses = (actor: Actor) => hasRole(actor, "vp_admin", "publisher", "principal");
export const canViewClass = (actor: Actor, classId: string) =>
  canOverseeClasses(actor) || actor.classTeacherOf.some(item => item.classId === classId);
export const canViewDirectorDashboard = (actor: Actor) => hasRole(actor, "director", "principal");

export type NavItem = { href: string; label: string };
export function navigationFor(actor: Actor): NavItem[] {
  const items: NavItem[] = [{ href: "/portal", label: "Overview" }];
  if (actor.teachesSubjects) items.push({ href: "/portal/teaching", label: "My score sheets" });
  if (actor.classTeacherOf.length || canOverseeClasses(actor)) items.push({ href: "/portal/classes", label: "Class results" });
  if (actor.kind === "student") items.push({ href: "/portal/results", label: "My results" });
  if (canViewDirectorDashboard(actor)) items.push({ href: "/portal/director", label: "Director dashboard" });
  return items;
}
