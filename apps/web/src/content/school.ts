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

export const phoneHref = (phone: string) => `tel:+234${phone.slice(1)}`;
export const formatPhone = (phone: string) => `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;

export const campuses = [
  { name: "Salolo", label: "Main campus", address: "39/40 Powerline Avenue, opposite FHA Estate, Salolo–Alagbado, Lagos" },
  { name: "Abule Egba", label: "Ekoro Road campus", address: "32/34 Ekoro Road, Abule Egba, Lagos" },
];

export const navigation = [
  { label: "Our school", href: "/#our-school" },
  { label: "Academics", href: "/#academics" },
  { label: "School life", href: "/#school-life" },
  { label: "Achievements", href: "/#achievements" },
  { label: "Campuses", href: "/#campuses" },
  { label: "Gallery", href: "/gallery" },
];

export const faqs = [
  { question: "How can I find out about admissions?", answer: "Call 08032367229, 07084370636, or 08024147831 to speak with the school about current admissions, requirements, fees, and visiting either campus. Admission dates and availability should be confirmed directly." },
  { question: "Where are the two campuses?", answer: "The Salolo main campus is at 39/40 Powerline Avenue, opposite FHA Estate, Salolo–Alagbado, Lagos. The Abule Egba campus is at 32/34 Ekoro Road, Abule Egba, Lagos." },
  { question: "Where can I see achievements and JAMB results?", answer: "Visit the Gallery to browse source-linked competition stories, published historical UTME highlights, and official InterswitchSPAK videos. The 2025 section includes Babalola David and Ayomide Victoria, both reported by the school at 364. Open School photos in the Gallery for the original 2025 and historical results posters. Private result slips are excluded." },
  { question: "Can students and teachers access the portal yet?", answer: "The school portal is the next stage of this project. Account access will be provided by the school when the portal is ready." },
  { question: "Are these photographs of the school?", answer: "The featured photographs show Brainfield students in publicly reported science and competition events. The competition and results photographs include founder-supplied images from the school’s public Facebook page, with source credits. The Sakura group also includes students and representatives from other Lagos schools. These are event photographs, rather than photographs of our classrooms or campuses." },
];
