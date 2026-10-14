import Link from "next/link";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { Brand } from "./brand";

export function Footer() {
  return <footer className="site-footer"><div className="page-shell"><div className="footer-main"><div><Link href="/" aria-label="Brainfield Schools Lagos home"><Brand /></Link><p>Determination and Focus.<br />Salolo & Abule Egba, Lagos.</p></div><nav aria-label="Footer navigation"><Link href="/#our-school">Our school</Link><Link href="/#academics">Academics</Link><Link href="/gallery">Gallery & achievements</Link><Link href="/gallery?category=results&year=2025">2025 JAMB results</Link><Link href="/#campuses">Our campuses</Link><Link href="/portal">School portal <ArrowTopRightIcon /></Link></nav><Link href="/#admissions" className="footer-cta">A brighter future<br /><em>starts with a conversation.</em><span>Get in touch <ArrowTopRightIcon /></span></Link></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Brainfield Schools Lagos</span><span>Website preview · Campus artwork is illustrative</span><a href="#main-content">Back to top ↑</a></div></div></footer>;
}
