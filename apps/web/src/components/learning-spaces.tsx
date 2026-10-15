"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { schoolPhotos } from "@/content/photos";
import { ArrowTopRightIcon, CheckIcon } from "@radix-ui/react-icons";
import { learningSpaces } from "@/content/school";

export function LearningSpaces() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = learningSpaces[active];
  const photo = schoolPhotos[current.photo];
  return (
    <div className="learning-spaces">
      <div className="space-tabs" role="tablist" aria-label="Student moments">
        {learningSpaces.map((space, index) => <button key={space.id} type="button" ref={element => { tabs.current[index] = element; }} role="tab" id={`tab-${space.id}`} aria-selected={active === index} aria-controls={`panel-${space.id}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
          let next = active;
          if (event.key === "ArrowRight") next = (active + 1) % learningSpaces.length;
          else if (event.key === "ArrowLeft") next = (active - 1 + learningSpaces.length) % learningSpaces.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = learningSpaces.length - 1;
          else return;
          event.preventDefault(); setActive(next); tabs.current[next]?.focus();
        }}><span>{space.number}</span>{space.label}<ArrowTopRightIcon /></button>)}
      </div>
      <div className="space-panel" role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`} tabIndex={0}>
        <figure className="student-moment-photo">
          <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 767px) 100vw, 55vw" />
          <figcaption>{photo.caption} · <a href={photo.source} target="_blank" rel="noopener noreferrer">Photo: {photo.credit}<span className="sr-only"> (opens in a new tab)</span></a></figcaption>
        </figure>
        <div className="space-copy">
          <span className="eyebrow">Real students. Real moments.</span>
          <h3>{current.title.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h3>
          <p>{current.description}</p>
          <ul>{current.tags.map(tag => <li key={tag}><CheckIcon />{tag}</li>)}</ul>
          <a href={photo.source} target="_blank" rel="noopener noreferrer" className="text-link">Read the full story <ArrowTopRightIcon /><span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </div>
    </div>
  );
}
