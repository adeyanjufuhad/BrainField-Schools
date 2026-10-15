"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

// Native observation keeps scroll work off the main thread; content stays visible without JS.
export function ScrollReveals() {
  useEffect(() => {
    const root = document.getElementById("main-content");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || preference.matches || !("IntersectionObserver" in window)) return;
    const context = gsap.context(() => {}, root);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        context.add(() => gsap.fromTo(entry.target, { opacity: 1, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out", clearProps: "opacity,transform" }));
      }
    }, { threshold: 0.08 });
    root.querySelectorAll(".section-heading, .about-section > div, .academic-grid > *, .recent-story, .champion-ribbon, .jamb-year-layout > div, .campus-card, .admissions-inner > div, .faq-section > div").forEach(element => observer.observe(element));
    const stop = () => { if (preference.matches) { observer.disconnect(); context.revert(); } };
    preference.addEventListener("change", stop);
    return () => { observer.disconnect(); preference.removeEventListener("change", stop); context.revert(); };
  }, []);
  return null;
}
