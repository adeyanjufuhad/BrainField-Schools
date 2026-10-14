import Link from "next/link";
import { ArrowTopRightIcon, ReaderIcon } from "@radix-ui/react-icons";
import { galleryHref, jamb2025Results } from "@/content/gallery";

export function Jamb2025() {
  return <section id="jamb-2025" className="jamb-year-section section-space" aria-labelledby="jamb-2025-title"><div className="page-shell jamb-year-layout">
    <div className="jamb-year-heading"><span className="eyebrow">The class of 2025</span><h2 id="jamb-2025-title">The effort behind<br /><em>every result.</em></h2><p>Our dedicated space for Brainfield’s 2025 JAMB / UTME results.</p><Link className="text-link" href={galleryHref("results", "2025")}>Explore the 2025 results <ArrowTopRightIcon /></Link></div>
    <div className="jamb-year-board"><div className="jamb-board-top"><span>JAMB / UTME</span><span className="year-pill">2025</span></div>
      {jamb2025Results.length > 0 ? <ul className="jamb-result-list">{jamb2025Results.map(result => <li key={result.id}><span>{result.student}</span><strong>{result.score}<span>/{result.maximum}</span></strong><a href={result.source} target="_blank" rel="noopener noreferrer" aria-label={`Read the source for ${result.student}’s ${result.year} result (opens in a new tab)`}><ArrowTopRightIcon /></a></li>)}</ul> : <div className="jamb-awaiting"><ReaderIcon /><h3>2025 results will appear here.</h3><p>A verified public results list is not available yet. We’ll publish the school-approved highlights once confirmed.</p><Link href={galleryHref("results")}>View published historical results <ArrowTopRightIcon /></Link></div>}
      <div className="jamb-board-footer">Individual results · Clearly dated · Verified before publication</div>
    </div>
  </div></section>;
}
