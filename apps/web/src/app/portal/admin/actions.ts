"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getDatabase, runWorkflow, WorkflowError } from "@/lib/db/neon";
import { getSessionState, isAdministrator, type Role } from "@/lib/portal/actor";
import { AccountError, createAuthAccount, studentLoginEmail, temporaryPassword } from "@/lib/portal/accounts";

export type Credentials = { name: string; login: string; password: string };
export type AdminResult = { ok: true; message: string; credentials?: Credentials } | { ok: false; error: string };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const email = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const roles: Role[] = ["administrator", "principal", "vp_admin", "publisher", "director"];
const text = (formData: FormData, key: string, max = 120) => String(formData.get(key) ?? "").trim().slice(0, max);

async function asAdministrator<T extends AdminResult>(work: (actorId: string) => Promise<T>): Promise<AdminResult> {
  const state = await getSessionState();
  if (state.status !== "ready") return { ok: false, error: "Your session has ended. Sign in again to continue." };
  if (!isAdministrator(state.actor)) return { ok: false, error: "Only a school administrator can make this change." };
  try {
    const result = await work(state.actor.profileId);
    for (const path of ["/portal", "/portal/admin", "/portal/admin/people", "/portal/classes"]) revalidatePath(path);
    return result;
  } catch (error) {
    if (error instanceof WorkflowError || error instanceof AccountError) return { ok: false, error: error.message };
    console.error("Administration change failed", error);
    return { ok: false, error: "Something went wrong. Nothing was changed. Please try again." };
  }
}

const call = (query: () => Promise<unknown>) => runWorkflow(query);

async function siteOrigin() {
  const origin = (await headers()).get("origin");
  if (!origin) throw new AccountError("Could not confirm this website’s address. Reload the page and try again.");
  return origin;
}

/** Creates the Auth account with a one-time password and links it to the profile by ID. */
async function provisionLogin(actorId: string, profileId: string, login: string, name: string): Promise<Credentials> {
  const password = temporaryPassword();
  const authUserId = await createAuthAccount(login, name, password, await siteOrigin());
  await call(() => getDatabase()`select app.admin_link_account(${actorId}, ${profileId}, ${authUserId})`);
  return { name, login, password };
}

export async function createClassAction(_previous: AdminResult | null, formData: FormData): Promise<AdminResult> {
  const name = text(formData, "name", 60);
  if (name.length < 2) return { ok: false, error: "Enter a class name, for example JSS 2 A." };
  return asAdministrator(async actorId => {
    await call(() => getDatabase()`select app.admin_create_class(${actorId}, ${name})`);
    return { ok: true, message: `${name} added. Now assign its class teacher and subject teachers.` };
  });
}

export async function createSubjectAction(_previous: AdminResult | null, formData: FormData): Promise<AdminResult> {
  const name = text(formData, "name", 60);
  if (name.length < 2) return { ok: false, error: "Enter a subject name, for example Biology." };
  return asAdministrator(async actorId => {
    await call(() => getDatabase()`select app.admin_create_subject(${actorId}, ${name})`);
    return { ok: true, message: `${name} added.` };
  });
}

export async function setSubjectTeacherAction(classId: string, subjectId: string, teacherId: string): Promise<AdminResult> {
  if (![classId, subjectId, teacherId].every(id => uuid.test(id))) return { ok: false, error: "Choose a teacher." };
  return asAdministrator(async actorId => {
    await call(() => getDatabase()`select app.admin_set_offering(${actorId}, ${classId}, ${subjectId}, ${teacherId})`);
    return { ok: true, message: "Subject teacher saved." };
  });
}

export async function setClassTeacherAction(classId: string, teacherId: string): Promise<AdminResult> {
  if (![classId, teacherId].every(id => uuid.test(id))) return { ok: false, error: "Choose a class teacher." };
  return asAdministrator(async actorId => {
    await call(() => getDatabase()`select app.admin_set_class_teacher(${actorId}, ${classId}, ${teacherId})`);
    return { ok: true, message: "Class teacher saved." };
  });
}

export async function addStaffAction(_previous: AdminResult | null, formData: FormData): Promise<AdminResult> {
  const name = text(formData, "name");
  const login = text(formData, "email", 254).toLowerCase();
  const granted = formData.getAll("roles").map(String).filter((role): role is Role => roles.includes(role as Role));
  if (name.length < 2) return { ok: false, error: "Enter the staff member’s full name." };
  if (!email.test(login)) return { ok: false, error: "Enter a valid email address for their sign-in." };
  return asAdministrator(async actorId => {
    const [row] = await call(() => getDatabase()`select app.admin_create_profile(${actorId}, ${name}, 'staff', null) as id`) as { id: string }[];
    for (const role of granted) await call(() => getDatabase()`select app.admin_set_role(${actorId}, ${row.id}, ${role}, true)`);
    try {
      const credentials = await provisionLogin(actorId, row.id, login, name);
      return { ok: true, message: `${name} added. Give them these sign-in details in person.`, credentials };
    } catch (error) {
      if (error instanceof AccountError || error instanceof WorkflowError) return { ok: false, error: `${name}’s profile was created, but not their sign-in: ${error.message} Use “Create sign-in” in the list to try again.` };
      throw error;
    }
  });
}

export async function addStudentAction(_previous: AdminResult | null, formData: FormData): Promise<AdminResult> {
  const name = text(formData, "name");
  const admission = text(formData, "admission", 32).toUpperCase();
  const classId = text(formData, "classId", 36);
  const withLogin = formData.get("createLogin") === "on";
  if (name.length < 2) return { ok: false, error: "Enter the student’s full name." };
  if (!/^[A-Z0-9][A-Z0-9/-]{1,30}$/.test(admission)) return { ok: false, error: "Enter an admission number using letters, numbers, / or -." };
  if (classId && !uuid.test(classId)) return { ok: false, error: "Choose a class." };
  return asAdministrator(async actorId => {
    const [row] = await call(() => getDatabase()`select app.admin_create_profile(${actorId}, ${name}, 'student', ${admission}) as id`) as { id: string }[];
    if (classId) await call(() => getDatabase()`select app.admin_enrol(${actorId}, ${row.id}, ${classId})`);
    if (!withLogin) return { ok: true, message: `${name} added${classId ? " and enrolled" : ""}.` };
    try {
      const credentials = await provisionLogin(actorId, row.id, studentLoginEmail(admission), name);
      return { ok: true, message: `${name} added. They sign in with their admission number and this temporary password.`, credentials: { ...credentials, login: admission } };
    } catch (error) {
      if (error instanceof AccountError || error instanceof WorkflowError) return { ok: false, error: `${name} was added, but not their sign-in: ${error.message} Use “Create sign-in” in the list to try again.` };
      throw error;
    }
  });
}

/** For profiles created without a sign-in, or when account creation failed. Staff need an email address. */
export async function createLoginAction(profileId: string, staffEmail: string): Promise<AdminResult> {
  if (!uuid.test(profileId)) return { ok: false, error: "This person could not be found." };
  return asAdministrator(async actorId => {
    const [person] = await getDatabase()`select full_name, kind, admission_number, auth_user_id from app.profiles where id = ${profileId}`;
    if (!person) return { ok: false, error: "This person could not be found." };
    if (person.auth_user_id) return { ok: false, error: `${person.full_name} already has a sign-in.` };
    const login = person.kind === "student" ? studentLoginEmail(String(person.admission_number)) : staffEmail.trim().toLowerCase();
    if (person.kind === "staff" && !email.test(login)) return { ok: false, error: "Enter a valid email address for their sign-in." };
    const credentials = await provisionLogin(actorId, profileId, login, String(person.full_name));
    return { ok: true, message: `Sign-in created for ${person.full_name}. Give them these details in person.`, credentials: person.kind === "student" ? { ...credentials, login: String(person.admission_number) } : credentials };
  });
}

export async function setActiveAction(profileId: string, active: boolean): Promise<AdminResult> {
  if (!uuid.test(profileId)) return { ok: false, error: "This person could not be found." };
  return asAdministrator(async actorId => {
    await call(() => getDatabase()`select app.admin_set_active(${actorId}, ${profileId}, ${active})`);
    return { ok: true, message: active ? "Access restored." : "Access removed. They can no longer open the portal." };
  });
}

export async function setRoleAction(profileId: string, role: string, granted: boolean): Promise<AdminResult> {
  if (!uuid.test(profileId) || !roles.includes(role as Role)) return { ok: false, error: "Choose a valid role." };
  return asAdministrator(async actorId => {
    await call(() => getDatabase()`select app.admin_set_role(${actorId}, ${profileId}, ${role}, ${granted})`);
    return { ok: true, message: granted ? "Role granted." : "Role removed." };
  });
}

export async function enrolAction(studentId: string, classId: string): Promise<AdminResult> {
  if (![studentId, classId].every(id => uuid.test(id))) return { ok: false, error: "Choose a class." };
  return asAdministrator(async actorId => {
    await call(() => getDatabase()`select app.admin_enrol(${actorId}, ${studentId}, ${classId})`);
    return { ok: true, message: "Class saved." };
  });
}
