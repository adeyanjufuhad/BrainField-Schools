import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Brand } from "@/components/brand";

export const metadata: Metadata = { title: "School portal" };

export default function Portal() {
  return <main className="portal-page"><Link href="/" aria-label="Brainfield Schools Lagos home"><Brand /></Link><span className="eyebrow">The next chapter</span><h1>Your school,<br /><em>connected.</em></h1><p>We’re preparing a dedicated space for students, teachers, and school leadership. The school will provide account access when the portal is ready.</p><Link href="/" className="button button-green"><ArrowLeftIcon />Back to the school website</Link><span className="portal-status">Portal access is not available yet.</span><div className="portal-audiences" aria-label="Planned school workspaces"><article><span>01</span><h2>Students</h2><p>Assignments, timetables and published results in one place.</p></article><article><span>02</span><h2>Teachers & leadership</h2><p>Teaching resources, result approvals and school administration.</p></article></div></main>;
}
