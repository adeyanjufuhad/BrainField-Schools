"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { schoolPhotoArchive } from "@/content/photos";

const slides = schoolPhotoArchive.filter(photo => photo.carousel !== false);
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

export function AwardsSlideshow() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const interacting = hovered || focused;
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const playing = !reducedMotion;
  const current = slides[active];

  useEffect(() => {
    if (!playing || interacting) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setActive(index => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [playing, interacting, active]);

  return <section className="awards-slideshow hero-visual" aria-label="School awards and published JAMB results" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <figure className="slideshow-frame" data-paused={interacting ? "true" : undefined}>
      <a href="/gallery?category=photos" className="slideshow-image-link" aria-label="Explore the school photo gallery">
        <Image key={current.id} className="hero-art slideshow-photo" src={current.src} width={current.width} height={current.height} alt={current.alt} preload={active === 0} unoptimized={current.poster} sizes="(max-width: 1023px) 100vw, 50vw" />
      </a>
      <figcaption className="sr-only">{current.year} · {current.caption}. Photo: {current.credit}. Sources and full-size photographs are available in the gallery.</figcaption>
      <div className="slideshow-navigation">
        <span className="slideshow-position" aria-hidden="true">{String(active + 1).padStart(2, "0")} <span>/ {slides.length}</span></span>
        <input className="slideshow-slider" type="range" min={0} max={slides.length - 1} value={active} aria-label="Choose slideshow image" aria-valuetext={`Image ${active + 1} of ${slides.length}: ${current.caption}`} onChange={event => setActive(Number(event.target.value))} />
      </div>
    </figure>
  </section>;
}
