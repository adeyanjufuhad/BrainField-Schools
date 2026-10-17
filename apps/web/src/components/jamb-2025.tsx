import Image from "next/image";
import Link from "next/link";
import { ArrowTopRightIcon, ReaderIcon } from "@radix-ui/react-icons";
import { galleryHref, jamb2025Results } from "@/content/gallery";
import { CountUp } from "@/components/react-bits/count-up";

export function Jamb2025() {
  return <section id="jamb-2025" className="jamb-year-section section-space" aria-labelledby="jamb-2025-title"><div className="page-shell jamb-year-layout">
    <div className="jamb-year-heading"><span className="eyebrow">Published 2025 highlights</span><h2 id="jamb-2025-title">The effort behind<br /><em>every result.</em></h2><p>Celebrating the results shared by Brainfield Schools Lagos, with the original posters in our photo archive.</p><Link className="text-link" href={galleryHref("results", "2025")}>Explore the 2025 results <ArrowTopRightIcon /></Link></div>
    <div className="jamb-year-board"><div className="jamb-board-top"><span>JAMB / UTME</span><span className="year-pill">2025</span></div>
      {jamb2025Results.length > 0 ? <ul className="jamb-result-list">{jamb2025Results.map(result => <li key={result.id}>
        <div className="jamb-result-head"><span>{result.student}</span><a href={result.source} target="_blank" rel="noopener noreferrer" aria-label={`Read the source for ${result.student}’s ${result.year} result (opens in a new tab)`}><ArrowTopRightIcon /></a></div>
        <strong><CountUp from={300} to={result.score} duration={1.8} /><span>/{result.maximum}</span></strong>
        {result.subjects && <dl className="jamb-subjects">{result.subjects.map(subject => <div key={subject.label}><dt>{subject.label}</dt><dd><span className="jamb-bar" aria-hidden="true"><span style={{ width: `${subject.score}%` }} /></span><CountUp to={subject.score} duration={1.4} delay={0.2} /></dd></div>)}</dl>}
      </li>)}</ul> : <div className="jamb-awaiting"><ReaderIcon /><h3>2025 results will appear here.</h3><p>A verified public results list is not available yet. We’ll publish the school-approved highlights once confirmed.</p><Link href={galleryHref("results")}>View published historical results <ArrowTopRightIcon /></Link></div>}
      {jamb2025Results.length > 0 && <Link className="jamb-poster-link" href="/gallery?category=photos&year=2025&q=UTME"><Image src="/photos/utme-2025-main.jpg" width={967} height={484} alt="Brainfield’s school-published 2025 UTME results poster" unoptimized /><span>View the full 2025 results posters <ArrowTopRightIcon /></span></Link>}
      <div className="jamb-board-footer">Individual highlights from school-published posters. Subject scores out of 100.</div>
    </div>
  </div></section>;
}
