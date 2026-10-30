import "server-only";
import { randomInt } from "node:crypto";

/**
 * Students without an email address sign in with a school login ID derived from their admission number.
 * The reserved .invalid domain guarantees these addresses never receive mail or collide with a real inbox.
 */
export const STUDENT_LOGIN_DOMAIN = "students.brainfield.invalid";

export const studentLoginEmail = (admissionNumber: string) =>
  `${admissionNumber.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-")}@${STUDENT_LOGIN_DOMAIN}`;

/** Accepts either an email address or a bare admission number on the sign-in form. */
export const loginEmailFor = (input: string) => input.includes("@") ? input : studentLoginEmail(input);

// No look-alike characters (0/o, 1/l/i) so a password can be read aloud or copied from paper.
const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
/** 16 random characters (about 79 bits), grouped for readability. Shown once to the administrator. */
export function temporaryPassword() {
  return Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("")).join("-");
}

export class AccountError extends Error {}

/**
 * Creates the Neon Auth account directly against the Auth service, without touching the administrator's own
 * session cookies. The caller links the returned user ID to the school profile; Auth alone grants nothing.
 */
export async function createAuthAccount(email: string, name: string, password: string, origin: string) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) throw new AccountError("School sign-in is not configured.");
  const response = await fetch(`${baseUrl}/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email, password, name }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { user?: { id?: string }; code?: string; message?: string };
  if (response.ok && body.user?.id) return body.user.id;
  if (response.status === 422 || body.code?.includes("EXIST")) throw new AccountError("A sign-in account already uses that email address.");
  if (response.status === 403) throw new AccountError("The sign-in service rejected this website’s address. Add it to Neon Auth’s trusted domains.");
  console.error("Account creation failed", response.status, body.code);
  throw new AccountError("The sign-in account could not be created. Please try again.");
}
