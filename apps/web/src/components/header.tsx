"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowTopRightIcon, Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Brand } from "./brand";
import { navigation } from "@/content/school";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner page-shell">
        <Link href="/" aria-label="BrainField Schools home" className="brand-link"><Brand /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="header-actions">
          <Link href="/portal" className="portal-link">School portal <ArrowTopRightIcon /></Link>
          <a className="button button-small button-green desktop-admissions" href="#admissions">Admissions <ArrowTopRightIcon /></a>
          <button className="menu-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <Cross1Icon /> : <HamburgerMenuIcon />}
          </button>
        </div>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-nav page-shell" aria-label="Mobile navigation" onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
        {navigation.map(item => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
        <a href="#admissions" onClick={() => setOpen(false)}>Admissions <ArrowTopRightIcon /></a>
      </nav>}
    </header>
  );
}
