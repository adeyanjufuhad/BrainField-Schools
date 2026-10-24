import type { Policy } from "@/lib/portal/queries";

/** Display-only grade preview. Published grades come from the database snapshot. */
export function gradeFor(total: number | null, policy: Pick<Policy, "bands">) {
  if (total === null) return null;
  return [...policy.bands].sort((a, b) => b.min - a.min).find(band => total >= band.min)?.grade ?? null;
}
