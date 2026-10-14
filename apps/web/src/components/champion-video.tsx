"use client";

import { useState } from "react";
import { ArrowTopRightIcon, PlayIcon, StarIcon } from "@radix-ui/react-icons";
import type { ChampionVideo as Video } from "@/content/gallery";

export function ChampionVideo({ video, featured = false }: { video: Video; featured?: boolean }) {
  const [playing, setPlaying] = useState(false);
  return <article className={`champion-video ${featured ? "video-featured" : ""}`}>
    <div className="video-screen">
      {playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`} title={`${video.title} — ${video.student}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <button type="button" className="video-poster" aria-label={`Play video: ${video.title}`} onClick={() => setPlaying(true)}>
        <span className="video-poster-top">INTERSWITCHSPAK <span>3.0</span></span>
        <span className="video-laurel" aria-hidden="true"><StarIcon /></span>
        <span className="video-poster-name">{video.student}</span>
        <span className="video-poster-caption">{video.id === "jubril-winner-video" ? "The champion’s story" : "The grand finale"}</span>
        <span className="video-play"><PlayIcon /><span>Watch the film</span><span>{video.duration}</span></span>
      </button>}
    </div>
    <div className="video-description"><span className="eyebrow">{video.label}</span><h3>{video.title}</h3><p>{video.description}</p><div className="video-links"><a href={video.source} target="_blank" rel="noopener noreferrer" className="text-link">Watch on YouTube <ArrowTopRightIcon /><span className="sr-only"> (opens in a new tab)</span></a>{playing && <button type="button" className="text-link" onClick={() => setPlaying(false)}>Close video player</button>}</div><small>Loads YouTube when you press play. Playback is provided by YouTube.</small></div>
  </article>;
}
