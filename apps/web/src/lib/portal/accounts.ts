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

type AuthBody = { user?: { id?: string }; code?: string; message?: string };

/** Calls the Auth service directly, never with the signed-in person's own session cookies. */
async function authPost(path: string, payload: object, origin: string, cookie?: string) {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) throw new AccountError("School sign-in is not configured.");
  const response = await fetch(`${baseUrl}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as AuthBody;
  return { response, body };
}

/**
 * Creates the Neon Auth account without touching the administrator's own session cookies.
 * The caller links the returned user ID to the school profile; Auth alone grants nothing.
 */
export async function createAuthAccount(email: string, name: string, password: string, origin: string) {
  const { response, body } = await authPost("sign-up/email", { email, password, name }, origin);
  if (response.ok && body.user?.id) return body.user.id;
  if (response.status === 422 || body.code?.includes("EXIST")) throw new AccountError("A sign-in account already uses that email address.");
  if (response.status === 403) throw new AccountError("The sign-in service rejected this website’s address. Add it to Neon Auth’s trusted domains.");
  console.error("Account creation failed", response.status, body.code);
  throw new AccountError("The sign-in account could not be created. Please try again.");
}

/**
 * Sets a new password on someone else's Auth account and signs them out everywhere. Only an Auth admin may do
 * this, so the server signs in as a dedicated service account (NEON_AUTH_SERVICE_EMAIL / _PASSWORD, created by
 * `npm run auth:service-account`) for this one request and signs it out again. That account is linked to no
 * school profile, so it can never open the portal. The school database decides who may reset whom.
 */
export async function resetAuthPassword(authUserId: string, password: string, origin: string) {
  const email = process.env.NEON_AUTH_SERVICE_EMAIL, secret = process.env.NEON_AUTH_SERVICE_PASSWORD;
  if (!email || !secret) throw new AccountError("Password reset is not set up on this website yet. Ask the developer to add the sign-in service account.");
  const signIn = await authPost("sign-in/email", { email, password: secret }, origin);
  if (!signIn.response.ok) {
    if (signIn.response.status === 429) throw new AccountError("The sign-in service is busy. Wait a minute, then try again.");
    console.error("Service account sign-in failed", signIn.response.status, signIn.body.code);
    throw new AccountError("Password reset is unavailable right now. Please try again later.");
  }
  const cookie = signIn.response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  try {
    const set = await authPost("admin/set-user-password", { userId: authUserId, newPassword: password }, origin, cookie);
    if (!set.response.ok) {
      console.error("Password reset failed", set.response.status, set.body.code);
      throw new AccountError("The password could not be reset. Nothing was changed. Please try again.");
    }
    // The portal still blocks old sessions until the new password is replaced, so this failing is not fatal.
    const revoke = await authPost("admin/revoke-user-sessions", { userId: authUserId }, origin, cookie);
    if (!revoke.response.ok) console.error("Revoking sessions after reset failed", revoke.response.status, revoke.body.code);
  } finally {
    await authPost("sign-out", {}, origin, cookie).catch(() => {});
  }
}
