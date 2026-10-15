/** Publicly reported highlights only. This is not a complete student-result database. */
export type GalleryCategory = "all" | "achievements" | "results" | "videos" | "photos";

type PublicStory = {
  id: string;
  category: Exclude<GalleryCategory, "all" | "photos">;
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
export type PublicResult = PublicStory & { category: "results"; score: number; maximum: number; subjects?: { label: string; score: number }[] };
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
    label: "2024 · InterswitchSPAK 6.0", title: "Fourth place on the national stage.", student: "David Babalola",
    description: "The school’s published 2025 poster reports fourth place in InterswitchSPAK 6.0. Earlier reporting also named David among the edition’s semi-finalists, representing Brainfield College, Salolo, Lagos.",
    source: "https://web.facebook.com/photo/?fbid=680714391385129", sourceName: "Brainfield Schools Lagos",
    note: "Fourth place is attributed to the school’s poster. The earlier Business Journal report independently supports semi-finalist participation; neither source identifies David as the winner of edition 6.0.",
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
  { id: "jets-2024", category: "achievements", year: 2024, theme: "global", label: "2024 · National JETS", title: "National science recognition.", student: "Babalola David", description: "The school’s 2025 poster identifies Babalola David as a 2024 national JETS champion. His subsequent Sakura Science Programme selection is separately reported by Edugist.", source: "https://web.facebook.com/photo/?fbid=680714391385129", sourceName: "Brainfield Schools Lagos", note: "School-reported recognition. Lagos State’s combined medals are not attributed to Brainfield alone." },
  { id: "eko-stem-2021", category: "achievements", year: 2021, theme: "science", label: "2021 · EKO STEM Quiz", title: "A place on the EKO STEM podium.", student: "Brainfield’s EKO STEM participants", description: "The school’s competition archive includes a November 2021 finals scoreboard placing Olajide first and Dokun second, alongside photographs of participants and presenters.", source: "https://web.facebook.com/photo/?fbid=110580044941576", sourceName: "Brainfield Schools Lagos", note: "The dated scoreboard is retained in the photo archive. Mixed-school event photographs are not presented as entirely Brainfield students." },
  { id: "boab-2021", category: "achievements", year: 2021, theme: "champion", label: "2021 · Beautiful Ones Are Born", title: "Celebrating effort together.", student: "Brainfield’s BOAB team", description: "School-shared archival photographs show the student team at the Beautiful Ones Are Born grand finale and a medal presentation.", source: "https://web.facebook.com/photo/?fbid=108845108448403", sourceName: "Brainfield Schools Lagos", note: "The photographs document participation and recognition without assigning an unverified student name or competition ranking." },
  championAchievement,
  { id: "physics-2021", category: "achievements", year: 2021, theme: "science", label: "2021 · National physics", title: "Representing Lagos. Taking first place.", student: "Seidu Samuel", description: "Part of the Lagos team reported as winning first place at the 2021 national physics competition.", source: "https://punchng.com/lagos-awards-varsity-scholarships-to-best-wassce-students/", sourceName: "PUNCH" },
  { id: "chemistry-2021", category: "achievements", year: 2021, theme: "science", label: "2021 · Oluwole Awokoya Chemistry", title: "Excellence across the sciences.", student: "Seidu Samuel", description: "Reported as the second-place finisher in the 2021 Oluwole Awokoya Chemistry Competition.", source: "https://www.thisdaylive.com/2021/11/17/lagos-awards-scholarship-to-2020-best-wassce-students/", sourceName: "THISDAY" },
];

export const publicJambResults: PublicResult[] = [
  { id: "utme-david-2025", category: "results", year: 2025, label: "2025 UTME · School-published highlight", title: "A 364-point achievement.", student: "Babalola David", score: 364, maximum: 400, description: "Brainfield’s published 2025 results poster reports 364 for Babalola David: English 73, Physics 96, Mathematics 98 and Chemistry 97.", source: "https://web.facebook.com/photo/?fbid=680714391385129", sourceName: "Brainfield Schools Lagos", subjects: [{ label: "English", score: 73 }, { label: "Physics", score: 96 }, { label: "Mathematics", score: 98 }, { label: "Chemistry", score: 97 }], note: "Attributed to the school’s public poster, rather than a private JAMB account or an independently verified national ranking." },
  { id: "utme-victoria-2025", category: "results", year: 2025, label: "2025 UTME · School-published highlight", title: "Determination, in every subject.", student: "Ayomide Victoria", score: 364, maximum: 400, description: "The school’s 2025 UTME poster reports 364 for Ayomide Victoria: English 75, Physics 98, Mathematics 97 and Chemistry 94.", source: "https://web.facebook.com/photo/?fbid=695876236535611", sourceName: "Brainfield Schools Lagos", subjects: [{ label: "English", score: 75 }, { label: "Physics", score: 98 }, { label: "Mathematics", score: 97 }, { label: "Chemistry", score: 94 }], note: "An individual school-published result. The original posters include further student highlights; unclear names are not guessed." },
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
