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

export const navigation = [
  { label: "Our school", href: "/#our-school" },
  { label: "Academics", href: "/#academics" },
  { label: "School life", href: "/#school-life" },
  { label: "Gallery", href: "/gallery" },
];

export const learningSpaces = [
  { id: "science", label: "Science opportunities", number: "01", title: "Curiosity that\nopens new doors.",
    description: "Brainfield’s Babalola David was selected alongside two Lagos State Senior Model College students for the 2025 Sakura Science Programme. This photograph shows the Lagos delegation at its pre-departure meeting.",
    tags: ["2025 Sakura Science Programme", "International selection", "Lagos delegation"], photo: "sakura" },
  { id: "competition", label: "National competitions", number: "02", title: "The focus.\nThe winning moment.",
    description: "Jubril Dokun represented Brainfield College, Salolo, and won InterswitchSPAK 3.0. Here, he receives the competition’s ₦7.5 million scholarship prize.",
    tags: ["InterswitchSPAK 3.0", "National champion", "STEM scholarship"], photo: "champion" },
] as const;

export const faqs = [
  { question: "How can I find out about admissions?", answer: "Call 08032367229, 07084370636, or 08024147831 to speak with the school about current admissions, requirements, fees, and visiting either campus. Admission dates and availability should be confirmed directly." },
  { question: "Where are the two campuses?", answer: "The Salolo main campus is at 39/40 Powerline Avenue, opposite FHA Estate, Salolo–Alagbado, Lagos. The Abule Egba campus is at 32/34 Ekoro Road, Abule Egba, Lagos." },
  { question: "Where can I see achievements and JAMB results?", answer: "Visit the Gallery to browse source-linked competition stories, published historical UTME highlights, and official InterswitchSPAK videos. The 2025 section includes Babalola David and Ayomide Victoria, both reported by the school at 364. Open School photos in the Gallery for the original 2025 and historical results posters. Private result slips are excluded." },
  { question: "Can students and teachers access the portal yet?", answer: "The school portal is the next stage of this project. Account access will be provided by the school when the portal is ready." },
  { question: "Are these photographs of the school?", answer: "The featured photographs show Brainfield students in publicly reported science and competition events. The competition and results photographs include founder-supplied images from the school’s public Facebook page, with source credits. The Sakura group also includes students and representatives from other Lagos schools. These are event photographs, rather than photographs of our classrooms or campuses." },
];
