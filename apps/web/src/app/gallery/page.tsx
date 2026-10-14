import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowTopRightIcon, ReaderIcon } from "@radix-ui/react-icons";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AchievementArt } from "@/components/achievement-art";
import { ChampionVideo } from "@/components/champion-video";
import { filterGallery, galleryHref, galleryYears, type GalleryCategory, type GalleryEntry } from "@/content/gallery";

export const metadata: Metadata = { title: "Gallery · Achievements, JAMB results & champion films", description: "Explore Brainfield Schools Lagos competition achievements, published JAMB / UTME highlights, and official champion videos." };

const categories: { value: GalleryCategory; label: string }[] = [
  { value: "all", label: "All stories" }, { value: "achievements", label: "Achievements" },
  { value: "results", label: "JAMB results" }, { value: "videos", label: "Champion films" },
];

function GalleryCard({ entry }: { entry: GalleryEntry }) {
  if (entry.category === "videos") return <ChampionVideo video={entry} />;
  return <article className={`gallery-story gallery-story-${entry.category}`}>
    {entry.category === "achievements" ? <AchievementArt theme={entry.theme} /> : <div className="gallery-result-art"><span>{entry.year} UTME</span><strong>{entry.score}<span>/{entry.maximum}</span></strong><span>Historical individual result</span></div>}
    <div className="gallery-story-copy"><span className="eyebrow">{entry.label}</span><h2>{entry.title}</h2><span className="gallery-student">{entry.student}</span><p>{entry.description}</p><a href={entry.source} target="_blank" rel="noopener noreferrer" className="text-link">Source: {entry.sourceName} <ArrowTopRightIcon /><span className="sr-only"> (opens in a new tab)</span></a>{entry.note && <details className="source-note"><summary>About this record</summary><p>{entry.note}</p></details>}</div>
  </article>;
}

export default async function Gallery({ searchParams }: { searchParams: Promise<{ category?: string; year?: string; q?: string }> }) {
  const params = await searchParams;
  const category: GalleryCategory = categories.some(item => item.value === params.category) ? params.category as GalleryCategory : "all";
  const year = galleryYears.some(value => String(value) === params.year) ? params.year! : "all";
  const query = typeof params.q === "string" ? params.q.slice(0, 120).trim() : "";
  const entries = filterGallery(category, year, query);
  const resultsOnly = category === "results";
  const waitingFor2025 = resultsOnly && year === "2025" && !query;
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="utility-bar"><div className="page-shell utility-inner"><span>Determination and Focus.</span><Link href="/#campuses">Two campuses. One Brainfield. <ArrowTopRightIcon /></Link></div></div>
    <Header />
    <main id="main-content">
      <section className="gallery-intro page-shell" aria-labelledby="gallery-title"><div><Link href="/" className="gallery-back"><ArrowLeftIcon />Back to our school</Link><span className="eyebrow">The Brainfield gallery</span><h1 id="gallery-title">Determination.<br /><em>On display.</em></h1><p>Competition stories, published JAMB highlights, and the moments our champions took the stage.</p></div><div className="gallery-intro-seal" aria-hidden="true"><span>THE EFFORT</span><strong>The focus.<br /><em>The future.</em></strong><span>SALOLO · ABULE EGBA</span></div></section>
      <section className="gallery-collection page-shell" aria-label="Published gallery records">
        <nav className="gallery-category-nav" aria-label="Gallery categories">{categories.map(item => <Link key={item.value} href={galleryHref(item.value, year, query)} aria-current={item.value === category ? "page" : undefined}>{item.label}<span>{filterGallery(item.value, year, query).length}</span></Link>)}</nav>
        <form action="/gallery" method="get" role="search" aria-label="Filter gallery" className="gallery-filters"><input type="hidden" name="category" value={category} /><div className="gallery-search"><label htmlFor="gallery-query">Search stories or students</label><input type="search" id="gallery-query" name="q" placeholder="Try a name, competition, or subject…" defaultValue={query} maxLength={120} /></div><div><label htmlFor="gallery-year">Year</label><select id="gallery-year" name="year" defaultValue={year}><option value="all">All years</option>{galleryYears.map(value => <option value={value} key={value}>{value}</option>)}</select></div><button type="submit" className="button button-green">Apply filters <ArrowTopRightIcon /></button>{(year !== "all" || query) && <Link href={galleryHref(category)} className="gallery-reset">Clear filters</Link>}</form>
        <div className="gallery-result-heading"><p><strong>{entries.length}</strong> published {entries.length === 1 ? "record" : "records"}{year !== "all" ? ` · ${year}` : ""}{query ? ` matching “${query}”` : ""}</p><span>Source-linked public highlights · Not a complete student register</span></div>
        {entries.length ? <div className="gallery-grid">{entries.map(entry => <GalleryCard key={entry.id} entry={entry} />)}</div> : <div className="gallery-empty"><ReaderIcon /><span className="eyebrow">{waitingFor2025 ? "2025 JAMB / UTME" : "Nothing found for these filters"}</span><h2>{waitingFor2025 ? "The next chapter is waiting." : "Let’s widen the search."}</h2><p>{waitingFor2025 ? "A verified public list of Brainfield’s 2025 results is not available here yet. This space is ready for school-approved results once confirmed." : "There are no published records matching this combination. Try another year, a different name, or clear the filters."}</p><Link href={galleryHref(resultsOnly ? "results" : "all")} className="button button-green">{waitingFor2025 ? "Browse published historical results" : "Clear filters and explore"}<ArrowTopRightIcon /></Link></div>}
        <aside className="publication-note"><ReaderIcon /><p>Every result has a year. Every story has a source. This gallery contains the public highlights we can verify, with private school records kept in the school’s authorised workflows.</p></aside>
      </section>
      <section className="gallery-closing"><div className="page-shell"><span className="eyebrow">The next story could be yours.</span><h2>Curiosity is only<br /><em>the beginning.</em></h2><Link href="/#admissions" className="button button-red">Get to know Brainfield <ArrowTopRightIcon /></Link></div></section>
    </main><Footer />
  </>;
}
