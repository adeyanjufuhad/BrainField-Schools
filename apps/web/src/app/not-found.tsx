import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return <main className="portal-page"><Brand /><span className="eyebrow">Page not found</span><h1>Let’s get you<br /><em>back on track.</em></h1><p>The page you’re looking for isn’t here.</p><Link href="/" className="button button-green">Return to the school website</Link></main>;
}
