import type { ReactNode } from "react";
import "./portal.css";

// Every portal page depends on the signed-in session.
export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return children;
}
