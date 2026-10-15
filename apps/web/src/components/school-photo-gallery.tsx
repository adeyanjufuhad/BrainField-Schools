import Image from "next/image";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { FadeContent } from "@/components/fade-content";
import type { SchoolPhoto } from "@/content/photos";

export function SchoolPhotoGallery({ photos }: { photos: SchoolPhoto[] }) {
  return <div className="school-photo-grid">{photos.map(photo => <article className="school-photo-card" key={photo.id}>
    <FadeContent><a className="school-photo-preview" href={photo.src} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size image: ${photo.caption} (opens in a new tab)`}><Image src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} unoptimized={photo.poster} sizes="(max-width: 767px) 100vw, 50vw" /></a></FadeContent>
    <div className="school-photo-copy"><span className="eyebrow">{photo.year} · {photo.label}</span><h2>{photo.caption}</h2><div className="school-photo-links"><a href={photo.src} target="_blank" rel="noopener noreferrer">Open full-size <ArrowTopRightIcon aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a><a href={photo.source} target="_blank" rel="noopener noreferrer">Source: {photo.credit} <ArrowTopRightIcon aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div>{photo.note && <p>{photo.note}</p>}</div>
  </article>)}</div>;
}
