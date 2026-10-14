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
  { question: "Where can I see achievements and JAMB results?", answer: "Visit the Gallery to browse source-linked competition stories, published historical UTME highlights, and official InterswitchSPAK videos. The 2025 JAMB section is ready, but no verified public 2025 list is available yet. This is not a complete list of every student’s private results." },
  { question: "Can students and teachers access the portal yet?", answer: "The school portal is the next stage of this project. Account access will be provided by the school when the portal is ready." },
  { question: "Are these photographs of the school?", answer: "The artwork on this page is an original illustration. It does not depict the actual campus. School-approved photographs will be added later." },
];
