/** Publicly reported highlights only. This is not a complete student-result database. */
export type GalleryCategory = "all" | "achievements" | "results" | "videos";

type PublicStory = {
  id: string;
  category: Exclude<GalleryCategory, "all">;
  year: number;
  label: string;
  title: string;
  student: string;
  description: string;
  source: string;
  sourceName: string;
  note?: string;
};

export type Achievement = PublicStory & { category: "achievements"; theme: "global" | "science" | "champion" };
export type PublicResult = PublicStory & { category: "results"; score: number; maximum: number };
export type ChampionVideo = PublicStory & { category: "videos"; videoId: string; duration: string };
export type GalleryEntry = Achievement | PublicResult | ChampionVideo;

export const recentAchievements: Achievement[] = [
  {
    id: "sakura-2025", category: "achievements", year: 2025, theme: "global",
    label: "2025 · International selection", title: "From Lagos, looking towards Japan.", student: "Babalola David",
    description: "Selected for the Sakura Science Programme in Tokyo, scheduled for 17–23 August 2025, following the Lagos team’s performance at the 2024 national JETS competition.",
    source: "https://edugist.org/three-lagos-students-set-for-japans-sakura-science-programme/", sourceName: "Edugist",
    note: "The report confirms selection for the programme, rather than attendance or a competition win.",
  },
  {
    id: "spak-6-semifinal", category: "achievements", year: 2024, theme: "science",
    label: "2024 · InterswitchSPAK 6.0", title: "Taking our place among the semi-finalists.", student: "David Babalola",
    description: "Named among the InterswitchSPAK 6.0 semi-finalists in a report published on 27 November 2024, representing Brainfield College, Salolo, Lagos.",
    source: "https://www.businessjournalng.com/interswitchspak-6-0-the-race-to-discover-nigerias-next-stem-champion/", sourceName: "Business Journal",
    note: "Semi-finalist recognition; this is not a claim that Brainfield won edition 6.0.",
  },
];

export const championAchievement: Achievement = {
  id: "spak-3-champion", category: "achievements", year: 2022, theme: "champion",
  label: "InterswitchSPAK 3.0 · Champion", title: "A national STEM champion.", student: "Jubril Dokun",
  description: "Winner of the third InterswitchSPAK National Science Competition, receiving a ₦7.5 million scholarship prize.",
  source: "https://interswitchgroup.com/news/newsletters/details/interswitchspak-nigeria-3-0-wraps-up-in-grand-style/", sourceName: "Interswitch",
  note: "Archived under the 2022 contemporary reporting year. The organiser’s article and contemporary reports disagree on the finale’s calendar year, so the achievement is identified by edition.",
};

export const archivedAchievements: Achievement[] = [
  championAchievement,
  { id: "physics-2021", category: "achievements", year: 2021, theme: "science", label: "2021 · National physics", title: "Representing Lagos. Taking first place.", student: "Seidu Samuel", description: "Part of the Lagos team reported as winning first place at the 2021 national physics competition.", source: "https://punchng.com/lagos-awards-varsity-scholarships-to-best-wassce-students/", sourceName: "PUNCH" },
  { id: "chemistry-2021", category: "achievements", year: 2021, theme: "science", label: "2021 · Oluwole Awokoya Chemistry", title: "Excellence across the sciences.", student: "Seidu Samuel", description: "Reported as the second-place finisher in the 2021 Oluwole Awokoya Chemistry Competition.", source: "https://www.thisdaylive.com/2021/11/17/lagos-awards-scholarship-to-2020-best-wassce-students/", sourceName: "THISDAY" },
];

export const publicJambResults: PublicResult[] = [
  { id: "utme-dokun-2022", category: "results", year: 2022, label: "2022 UTME · Historical highlight", title: "Determination, in numbers.", student: "Dokun Jubril", score: 354, maximum: 400, description: "PUNCH reported Dokun Jubril among the high scorers in the 2022 UTME. School affiliation is corroborated by Interswitch’s Brainfield champion report.", source: "https://punchng.com/jamb-releases-cut-off-says-admission-ends-dec-31/", sourceName: "PUNCH", note: "An individual historical score, not a school average, pass rate, or complete cohort list." },
];

export const championVideos: ChampionVideo[] = [
  { id: "jubril-winner-video", category: "videos", year: 2022, label: "Official InterswitchSPAK film", title: "Meet our national STEM champion.", student: "Jubril Dokun", description: "The competition organiser’s winner feature: “InterswitchSPAK 3.0 Winner, Jubril Dokun!”", source: "https://www.youtube.com/watch?v=2249BfVqz7o", sourceName: "InterswitchSPAK on YouTube", videoId: "2249BfVqz7o", duration: "4:59" },
  { id: "spak-3-finale-video", category: "videos", year: 2022, label: "Official competition broadcast", title: "Watch the InterswitchSPAK 3.0 grand finale.", student: "Jubril Dokun and the finalists", description: "The official InterswitchSPAK Nigeria 3.0 finale broadcast, featuring the competition’s finalists and winners.", source: "https://www.youtube.com/watch?v=HrmYjxnY7ew", sourceName: "InterswitchSPAK on YouTube", videoId: "HrmYjxnY7ew", duration: "28 min" },
];

export const galleryEntries: GalleryEntry[] = [...recentAchievements, ...archivedAchievements, ...publicJambResults, ...championVideos];
export const requestedJambYear = 2025;
export const jamb2025Results = publicJambResults.filter(result => result.year === requestedJambYear);
export const galleryYears = [...new Set([requestedJambYear, ...galleryEntries.map(entry => entry.year)])].sort((a, b) => b - a);

export function filterGallery(category: GalleryCategory, year: string, query: string): GalleryEntry[] {
  const search = query.trim().toLocaleLowerCase("en-NG");
  return galleryEntries.filter(entry => (category === "all" || entry.category === category)
    && (year === "all" || String(entry.year) === year)
    && (!search || `${entry.title} ${entry.student} ${entry.label} ${entry.description}`.toLocaleLowerCase("en-NG").includes(search)));
}

export function galleryHref(category: GalleryCategory, year = "all", query = "") {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (year !== "all") params.set("year", year);
  if (query.trim()) params.set("q", query.trim());
  return `/gallery${params.size ? `?${params}` : ""}`;
}
