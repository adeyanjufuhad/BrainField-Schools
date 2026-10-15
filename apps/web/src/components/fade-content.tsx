"use client";

// Adapted from React Bits FadeContent by David Haz, MIT + Commons Clause.
// Full notice: docs/third-party/REACT-BITS-LICENSE.md.
// This variant keeps server content visible and omits blur/noise effects.
import { memo, useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

export const FadeContent = memo(function FadeContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return;
    const context = gsap.context(() => {}, element);
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      context.add(() => gsap.fromTo(element, { opacity: 0.9, y: 12 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", clearProps: "opacity,transform" }));
    }, { threshold: 0.08 });
    const stopMotion = () => { if (motionPreference.matches) { observer.disconnect(); context.revert(); } };
    motionPreference.addEventListener("change", stopMotion);
    observer.observe(element);
    return () => { observer.disconnect(); motionPreference.removeEventListener("change", stopMotion); context.revert(); };
  }, []);
  return <div ref={ref} className={className} data-react-bits="fade-content">{children}</div>;
});
