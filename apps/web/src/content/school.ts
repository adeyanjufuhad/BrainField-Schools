/** Replace draft copy only with school-approved details. No invented results or contact data. */
export const school = {
  name: "Brainfield Schools Lagos",
  shortName: "Brainfield",
  description: "Brainfield Schools Lagos. Determination and Focus. Discover our Salolo and Abule Egba campuses, academic achievements, and school community.",
  officialMotto: "Determination and Focus",
  email: null as string | null,
  phones: ["08032367229", "07084370636", "08024147831"],
  preview: true,
};

export const campuses = [
  { name: "Salolo", label: "Main campus", address: "39/40 Powerline Avenue, opposite FHA Estate, Salolo–Alagbado, Lagos" },
  { name: "Abule Egba", label: "Ekoro Road campus", address: "32/34 Ekoro Road, Abule Egba, Lagos" },
];

export const achievements = [
  { category: "National science", edition: "InterswitchSPAK 3.0", title: "A national STEM champion.", name: "Jubril Dokun", description: "Winner of the third InterswitchSPAK National Science Competition, receiving a ₦7.5 million scholarship prize.", source: "https://interswitchgroup.com/news/newsletters/details/interswitchspak-nigeria-3-0-wraps-up-in-grand-style/", sourceName: "Interswitch" },
  { category: "Physics · 2021", edition: "National competition", title: "Representing Lagos. Taking first place.", name: "Seidu Samuel", description: "Part of the Lagos team reported as winning first place at the 2021 national physics competition.", source: "https://punchng.com/lagos-awards-varsity-scholarships-to-best-wassce-students/", sourceName: "PUNCH" },
  { category: "Chemistry · 2021", edition: "Oluwole Awokoya", title: "Excellence across the sciences.", name: "Seidu Samuel", description: "Reported as the second-place finisher in the 2021 Oluwole Awokoya Chemistry Competition.", source: "https://www.thisdaylive.com/2021/11/17/lagos-awards-scholarship-to-2020-best-wassce-students/", sourceName: "THISDAY" },
];

export const navigation = [
  { label: "Our school", href: "#our-school" },
  { label: "Academics", href: "#academics" },
  { label: "School life", href: "#school-life" },
  { label: "Achievements", href: "#achievements" },
];

export const learningSpaces = [
  { id: "science", label: "Science & discovery", number: "01", title: "Big questions.\nHands-on discovery.",
    description: "A space for asking why, testing ideas, and seeing classroom concepts come to life.",
    tags: ["Scientific thinking", "Practical learning", "Exploration"], illustration: "science" },
  { id: "technology", label: "ICT & programming", number: "02", title: "From curious learners\nto creative builders.",
    description: "Explore the possibilities of digital learning, from understanding computers to writing a first line of code.",
    tags: ["Digital skills", "Creative problem-solving", "Programming"], illustration: "technology" },
] as const;

export const faqs = [
  { question: "How can I find out about admissions?", answer: "Call 08032367229, 07084370636, or 08024147831 to speak with the school about current admissions, requirements, fees, and visiting either campus. Admission dates and availability should be confirmed directly." },
  { question: "Where are the two campuses?", answer: "The Salolo main campus is at 39/40 Powerline Avenue, opposite FHA Estate, Salolo–Alagbado, Lagos. The Abule Egba campus is at 32/34 Ekoro Road, Abule Egba, Lagos." },
  { question: "Where do the achievement highlights come from?", answer: "Each competition highlight links to its public source. The UTME highlight is a historical 2022 result reported by PUNCH, rather than a current school-wide average or pass rate." },
  { question: "Can students and teachers access the portal yet?", answer: "The school portal is the next stage of this project. Account access will be provided by the school when the portal is ready." },
  { question: "Are these photographs of the school?", answer: "The artwork on this page is an original illustration. It does not depict the actual campus. School-approved photographs will be added later." },
];
