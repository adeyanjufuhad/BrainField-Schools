import Link from "next/link";
import { ArrowTopRightIcon, MobileIcon } from "@radix-ui/react-icons";
import { Brand } from "./brand";
import { campuses, formatPhone, phoneHref, school } from "@/content/school";

export function Footer() {
  return <footer className="site-footer"><div className="page-shell">
    <div className="footer-cta"><p>A brighter future<br /><em>starts with a conversation.</em></p><Link href="/#admissions" className="button button-white">Get in touch <ArrowTopRightIcon /></Link></div>
    <div className="footer-main">
      <div className="footer-brand"><Link href="/" aria-label="Brainfield Schools Lagos home"><Brand light /></Link><p>{school.officialMotto}.<br />Salolo & Abule Egba, Lagos.</p></div>
      <nav aria-label="Footer navigation"><h2>Explore</h2><Link href="/#our-school">Our school</Link><Link href="/#academics">Academics</Link><Link href="/gallery">Gallery & achievements</Link><Link href="/gallery?category=results&year=2025">2025 JAMB results</Link><Link href="/portal">School portal <ArrowTopRightIcon /></Link></nav>
      <div className="footer-campuses"><h2>Campuses</h2>{campuses.map(campus => <p key={campus.name}><strong>{campus.name}</strong> · {campus.label}<br />{campus.address}</p>)}</div>
      <div className="footer-phones"><h2>Call the school</h2>{school.phones.map(phone => <a key={phone} href={phoneHref(phone)}><MobileIcon />{formatPhone(phone)}</a>)}</div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Brainfield Schools Lagos</span><span>{school.officialMotto} · Lagos, Nigeria</span><a href="#main-content">Back to top ↑</a></div>
  </div></footer>;
}
