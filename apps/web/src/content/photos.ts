/** Publicly published editorial photographs. Provenance: docs/PHOTO-SOURCES.md. */
export type SchoolPhoto = { id: string; src: string; width: number; height: number; year: number; label: string; alt: string; caption: string; credit: string; source: string; poster?: boolean; carousel?: boolean; note?: string };

export const schoolPhotos = {
  champion: {
    id: "interswitch-prize-stage", year: 2022, label: "InterswitchSPAK 3.0",
    src: "/photos/jubril-dokun-interswitchspak.jpg",
    width: 1097, height: 771,
    alt: "Brainfield’s Jubril Dokun receiving his InterswitchSPAK 3.0 scholarship prize on stage",
    caption: "Jubril Dokun · InterswitchSPAK 3.0 national champion",
    credit: "Interswitch",
    source: "https://interswitchgroup.com/news/newsletters/details/interswitchspak-nigeria-3-0-wraps-up-in-grand-style/",
  },
  sakura: {
    id: "sakura-delegation-2025", year: 2025, label: "2025 Sakura Science selection",
    src: "/photos/sakura-science-selection-2025.jpg",
    width: 1016, height: 762,
    alt: "The Lagos Sakura Science Programme delegation, including Brainfield’s Babalola David, at the 2025 pre-departure meeting",
    caption: "2025 Sakura selection · Lagos students and representatives",
    credit: "Edugist",
    source: "https://edugist.org/three-lagos-students-set-for-japans-sakura-science-programme/",
  },
} as const;


export const uploadedSchoolPhotos: SchoolPhoto[] = [
  {
    "id": "jubril-prize-portrait",
    "src": "/photos/jubril-dokun-prize-portrait.jpg",
    "width": 638,
    "height": 480,
    "year": 2022,
    "label": "InterswitchSPAK 3.0",
    "caption": "Jubril Dokun with his scholarship prize",
    "alt": "Jubril Dokun holding the InterswitchSPAK 3.0 scholarship presentation cheque",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=108845445115036",
    "poster": false
  },
  {
    "id": "david-utme-2025",
    "src": "/photos/babalola-david-utme-2025.jpg",
    "width": 897,
    "height": 906,
    "year": 2025,
    "label": "2025 UTME · 364/400",
    "caption": "Babalola David’s 2025 UTME highlight",
    "alt": "School-published poster reporting Babalola David’s 2025 UTME score of 364 out of 400",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=680714391385129",
    "poster": true
  },
  {
    "id": "utme-2025-main",
    "src": "/photos/utme-2025-main.jpg",
    "width": 967,
    "height": 484,
    "year": 2025,
    "label": "2025 JAMB / UTME",
    "caption": "The school’s published 2025 results poster",
    "alt": "Brainfield’s 2025 UTME results poster, including Babalola David and Ayomide Victoria with 364 each",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=695876236535611",
    "poster": true,
    "note": "School-published 2025 highlights. The poster is preserved rather than guessing unclear student names."
  },
  {
    "id": "utme-2025-more",
    "src": "/photos/utme-2025-more.jpg",
    "width": 1000,
    "height": 500,
    "year": 2025,
    "label": "2025 JAMB / UTME",
    "caption": "More published 2025 results",
    "alt": "The continuation of the school’s published 2025 UTME results poster",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=695876279868940",
    "poster": true,
    "note": "School-published 2025 highlights. The poster is preserved rather than guessing unclear student names."
  },
  {
    "id": "utme-2022-poster",
    "src": "/photos/utme-2022-poster.jpg",
    "width": 374,
    "height": 534,
    "year": 2022,
    "label": "2022 JAMB / UTME",
    "caption": "The 2022 UTME champions poster",
    "alt": "Brainfield’s historical 2022 UTME poster showing individual scores, including Jubril Dokun’s 354",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=138329042166676",
    "poster": true
  },
  {
    "id": "boab-medal",
    "src": "/photos/boab-medal-presentation.jpg",
    "width": 590,
    "height": 590,
    "year": 2021,
    "label": "BOAB · Archival competition photos",
    "caption": "A medal-winning moment",
    "alt": "A Brainfield student receiving a medal at the Beautiful Ones Are Born competition grand finale",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=108845108448403",
    "poster": false
  },
  {
    "id": "boab-team",
    "src": "/photos/boab-student-team.jpg",
    "width": 590,
    "height": 590,
    "year": 2021,
    "label": "BOAB · Archival competition photos",
    "caption": "Together on the competition stage",
    "alt": "Brainfield students posing together at the Beautiful Ones Are Born competition",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=108845125115068",
    "poster": false
  },
  {
    "id": "eko-contestants",
    "src": "/photos/eko-stem-contestants.jpg",
    "width": 1280,
    "height": 960,
    "year": 2021,
    "label": "EKO STEM · Archival competition photos",
    "caption": "Focus at the finalists’ desks",
    "alt": "Students from participating schools at their EKO STEM Quiz competition desks",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=110580744941506",
    "poster": false,
    "note": "Archival event imagery. The scoreboard identifies November 2021; mixed-school group photos are not represented as entirely Brainfield students."
  },
  {
    "id": "eko-group",
    "src": "/photos/eko-stem-group.jpg",
    "width": 1280,
    "height": 960,
    "year": 2021,
    "label": "EKO STEM · Archival competition photos",
    "caption": "The people behind the competition",
    "alt": "EKO STEM Quiz participants and presenters posing in front of the event backdrop",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=110579924941588",
    "poster": false,
    "note": "Archival event imagery. The scoreboard identifies November 2021; mixed-school group photos are not represented as entirely Brainfield students."
  },
  {
    "id": "eko-scoreboard",
    "src": "/photos/eko-stem-scoreboard-2021.jpg",
    "width": 472,
    "height": 590,
    "year": 2021,
    "label": "EKO STEM finals · November 2021",
    "caption": "A place on the podium",
    "alt": "A photographed EKO STEM Quiz finals scoreboard labelled November 2021",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=110580044941576",
    "poster": true,
    "note": "Archival event imagery. The scoreboard identifies November 2021; mixed-school group photos are not represented as entirely Brainfield students."
  },
  {
    "id": "eko-group-wide",
    "src": "/photos/eko-stem-group-wide.jpg",
    "width": 399,
    "height": 501,
    "year": 2021,
    "label": "EKO STEM · Archival competition photos",
    "caption": "A shared moment after the quiz",
    "alt": "A group of EKO STEM Quiz students and representatives at the event",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=110580154941565",
    "poster": false,
    "note": "Archival event imagery. The scoreboard identifies November 2021; mixed-school group photos are not represented as entirely Brainfield students."
  },
  {
    "id": "david-spak",
    "src": "/photos/david-babalola-interswitchspak.jpg",
    "width": 399,
    "height": 501,
    "year": 2024,
    "label": "InterswitchSPAK 6.0",
    "caption": "David Babalola on the national stage",
    "alt": "School-shared broadcast image labelled David Babalola, Brainfield College, Salolo, Lagos State",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/interswitchspak/videos/1158973422656958/",
    "poster": true
  },
  {
    "id": "jubril-eko-desk",
    "src": "/photos/jubril-dokun-eko-stem-desk.jpg",
    "width": 447,
    "height": 447,
    "year": 2021,
    "label": "EKO STEM · Archival competition photos",
    "caption": "Ready for the next question",
    "alt": "A student behind an EKO STEM Quiz desk labelled Dokun Jubril, Brainfield College, Abule Egba",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=110580568274857",
    "poster": false,
    "note": "Archival event imagery. The scoreboard identifies November 2021; mixed-school group photos are not represented as entirely Brainfield students."
  },
  {
    "id": "legacy-awards-poster",
    "src": "/photos/school-awards-archive-poster.jpg",
    "width": 1080,
    "height": 467,
    "year": 2022,
    "label": "School awards · Archival poster",
    "caption": "InterswitchSPAK and EKO STEM recognition",
    "alt": "An archival school poster featuring scholarship presentations and dated admission information",
    "credit": "Brainfield Schools Lagos",
    "source": "https://web.facebook.com/photo/?fbid=182848671171706",
    "poster": true,
    "carousel": false,
    "note": "Archival advertisement. Its admission dates and availability are historical, not current."
  }
];

export const additionalSchoolPhotos: SchoolPhoto[] = [
  {
    id: "spak-prize-group", src: "/photos/interswitch-prize-group.jpg", width: 760, height: 570,
    year: 2022, label: "InterswitchSPAK 3.0 · Prize presentation",
    caption: "Jubril Dokun with his scholarship award",
    alt: "Jubril Dokun holding his InterswitchSPAK scholarship presentation cheque with event guests",
    credit: "Brainfield Schools Lagos", source: "https://web.facebook.com/photo/?fbid=108845078448406",
    note: "The presentation cheque is dated 5 February 2022."
  },
  {
    id: "boab-awards-group", src: "/photos/boab-awards-group.jpg", width: 960, height: 960,
    year: 2021, label: "BOAB · Archival award presentation",
    caption: "Celebrating a BOAB competition award",
    alt: "A Brainfield student wearing a medal with event guests at the Beautiful Ones Are Born awards ceremony",
    credit: "Brainfield Schools Lagos", source: "https://web.facebook.com/photo/?fbid=108845215115059",
    note: "Archived with the school's BOAB collection; the student's name and individual placing are not inferred."
  }
];

export const schoolPhotoArchive: SchoolPhoto[] = [...uploadedSchoolPhotos, ...additionalSchoolPhotos, schoolPhotos.sakura, schoolPhotos.champion];

export const achievementPhotos = {
  "sakura-2025": schoolPhotos.sakura,
  "spak-3-champion": uploadedSchoolPhotos[0],
  "spak-6-semifinal": uploadedSchoolPhotos.find(photo => photo.id === "david-spak")!,
  "jets-2024": uploadedSchoolPhotos.find(photo => photo.id === "david-utme-2025")!,
  "boab-2021": uploadedSchoolPhotos.find(photo => photo.id === "boab-team")!,
  "eko-stem-2021": uploadedSchoolPhotos.find(photo => photo.id === "eko-group")!,
};

export function photoForAchievement(id: string): SchoolPhoto | undefined {
  return achievementPhotos[id as keyof typeof achievementPhotos];
}

export function filterSchoolPhotos(year: string, query: string) {
  const search = query.trim().toLocaleLowerCase("en-NG");
  return schoolPhotoArchive.filter(photo => (year === "all" || String(photo.year) === year) && (!search || `${photo.label} ${photo.caption} ${photo.alt}`.toLocaleLowerCase("en-NG").includes(search)));
}
