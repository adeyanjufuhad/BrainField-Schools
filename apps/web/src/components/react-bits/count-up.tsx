"use client";

// Adapted from React Bits CountUp by David Haz, MIT + Commons Clause. Source: https://reactbits.dev/r/CountUp-TS-TW.json
// Full notice: docs/third-party/REACT-BITS-LICENSE.md. Integrated into this school website only.
// School-site changes: count mode only; requestAnimationFrame and IntersectionObserver replace the `motion`
// dependency; the server renders the final value so the real figure is present without JavaScript;
// screen readers receive the final value; reduced motion shows the final value immediately.
import { useEffect, useRef } from "react";

type CountUpProps = {
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
};

// The original easeOut is cubicBezier(0.33, 1, 0.68, 1), the standard ease-out cubic.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const getDecimalPlaces = (num: number) => {
  const decimals = num.toString().split(".")[1];
  return decimals && parseInt(decimals) !== 0 ? decimals.length : 0;
};

const formatNumber = (value: number, places: number, separator: string, prefix: string, suffix: string) => {
  const [int, frac] = value.toFixed(places).split(".");
  return `${prefix}${separator ? int.replace(/\B(?=(\d{3})+(?!\d))/g, separator) : int}${frac ? `.${frac}` : ""}${suffix}`;
};

export function CountUp({ to, from = 0, delay = 0, duration = 2, decimals, separator = "", prefix = "", suffix = "", className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const places = decimals ?? Math.max(getDecimalPlaces(from), getDecimalPlaces(to));
  const finalText = formatNumber(to, places, separator, prefix, suffix);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const formatValue = (value: number) => formatNumber(value, places, separator, prefix, suffix);
    // Only count numbers that start below the fold, so visitors never see the real value reset to zero.
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    let frame = 0;
    let timer = 0;
    element.textContent = formatValue(from);
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      timer = window.setTimeout(() => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / (duration * 1000));
          element.textContent = formatValue(from + (to - from) * easeOut(progress));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }, delay * 1000);
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      element.textContent = formatValue(to);
    };
  }, [to, from, delay, duration, places, separator, prefix, suffix]);

  return <span className={`tabular-nums ${className}`.trim()}><span ref={ref} aria-hidden="true">{finalText}</span><span className="sr-only">{finalText}</span></span>;
}
