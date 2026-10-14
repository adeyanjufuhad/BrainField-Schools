"use client";

import { useRef, useState } from "react";
import { ArrowTopRightIcon, CheckIcon } from "@radix-ui/react-icons";
import { learningSpaces } from "@/content/school";

export function LearningSpaces() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = learningSpaces[active];
  return (
    <div className="learning-spaces">
      <div className="space-tabs" role="tablist" aria-label="Learning spaces">
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
        <div className={`space-art ${current.illustration}`} aria-hidden="true">
          {active === 0 ? <svg viewBox="0 0 500 350" fill="none">
            <circle cx="265" cy="160" r="125" fill="#a7c957" opacity=".32" />
            <path d="M98 273h307" stroke="#386641" strokeWidth="3" />
            <path d="m191 100 22 49v57l-49 67h153l-49-67v-57l22-49" fill="#ffffff" stroke="#386641" strokeWidth="4" />
            <path d="m188 239 28-36h49l28 36" fill="#a7c957" />
            <path d="M209 101h63M213 149h55" stroke="#386641" strokeWidth="4" />
            <path d="M320 182v65c0 35 52 35 52 0v-65" fill="#ffffff" stroke="#386641" strokeWidth="4" />
            <path d="M322 229h48v18c0 31-48 31-48 0v-18Z" fill="#6a994e" />
            <ellipse cx="143" cy="151" rx="55" ry="18" transform="rotate(-40 143 151)" stroke="#386641" strokeWidth="2" />
            <ellipse cx="143" cy="151" rx="55" ry="18" transform="rotate(40 143 151)" stroke="#386641" strokeWidth="2" />
            <circle cx="143" cy="151" r="7" fill="#d00000" />
            <circle cx="244" cy="181" r="5" fill="#6a994e" /><circle cx="252" cy="169" r="3" fill="#6a994e" />
            <path d="M380 100v24m-12-12h24" stroke="#386641" strokeWidth="2" />
          </svg> : <svg viewBox="0 0 500 350" fill="none">
            <circle cx="250" cy="170" r="130" fill="#a7c957" opacity=".3" />
            <rect x="100" y="82" width="300" height="185" rx="12" fill="#386641" />
            <rect x="112" y="95" width="276" height="155" rx="4" fill="#ffffff" />
            <path d="m82 267-18 16h372l-18-16H82Z" fill="#6a994e" />
            <path d="m196 144-29 28 29 28m108-56 29 28-29 28m-39-72-30 88" stroke="#386641" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="323" y="226" width="88" height="59" rx="9" fill="#a7c957" /><path d="m352 245 8 8-8 8m17 0h12" stroke="#386641" strokeWidth="3" />
            <circle cx="118" cy="80" r="20" fill="#d00000" /><path d="M118 72v16m-8-8h16" stroke="#ffffff" strokeWidth="2" />
          </svg>}
          <span className="art-caption">Illustrative learning space</span>
        </div>
        <div className="space-copy">
          <span className="eyebrow">Room to explore</span>
          <h3>{current.title.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h3>
          <p>{current.description}</p>
          <ul>{current.tags.map(tag => <li key={tag}><CheckIcon />{tag}</li>)}</ul>
          <a href="#admissions" className="text-link">Get to know the school <ArrowTopRightIcon /></a>
        </div>
      </div>
    </div>
  );
}
