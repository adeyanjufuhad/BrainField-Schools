import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

let instance: ReturnType<typeof createNeonAuth> | null | undefined;

/** Lazy setup keeps public pages independent of private backend configuration. */
export function getNeonAuth() {
  if (instance !== undefined) return instance;
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  instance = null;
  if (!baseUrl || !secret || secret.length < 32) return instance;
  try {
    if (new URL(baseUrl).protocol !== "https:") return instance;
  } catch {
    return instance;
  }
  instance = createNeonAuth({ baseUrl, cookies: { secret } });
  return instance;
}
