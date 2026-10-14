import Image from "next/image";
import Link from "next/link";
import { ArrowDownIcon, ArrowRightIcon, ArrowTopRightIcon, CheckIcon, ChevronDownIcon, GlobeIcon, HeartIcon, LightningBoltIcon, MobileIcon, ReaderIcon, StarIcon } from "@radix-ui/react-icons";
import { Header } from "@/components/header";
import { Brand } from "@/components/brand";
import { LearningSpaces } from "@/components/learning-spaces";
import { achievements, campuses, faqs, school } from "@/content/school";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="utility-bar"><div className="page-shell utility-inner"><span>Determination and Focus.</span><a href="#campuses">Two campuses. One Brainfield. <ArrowTopRightIcon /></a></div></div>
      <Header />
      <main id="main-content">
        <section className="hero page-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-rule" />Welcome to Brainfield Schools Lagos</div>
            <h1 id="hero-title">Bright minds.<br />Strong character.<br /><em>Endless possibilities.</em></h1>
            <p>A love of learning. The courage to try. The determination to go further. Your child’s next chapter starts here.</p>
            <div className="hero-actions"><a href="#admissions" className="button button-red">Discover Brainfield <ArrowTopRightIcon /></a><a href="#our-school" className="hero-secondary">Get to know us <ArrowRightIcon /></a></div>
            <div className="hero-location"><span className="location-dots"><span /><span /></span><a href="#campuses">Salolo–Alagbado</a><span className="location-separator" /><a href="#campuses">Abule Egba</a><span className="location-city">Lagos, Nigeria</span></div>
          </div>
          <figure className="hero-visual">
            <div className="hero-art-frame">
              <div className="hero-art-label"><span /> A world of discovery</div>
              <Image src="/illustrations/brainfield-campus.svg" width={640} height={650} priority alt="Conceptual illustration of students, books, and a green school building; not the actual Brainfield campus" className="hero-art" />
              <div className="hero-art-bottom"><span>LEARN. DISCOVER. BECOME.</span><ArrowDownIcon /></div>
            </div>
            <div className="motto-note"><span className="note-icon"><StarIcon /></span><span>Small steps today.<br /><strong>Remarkable futures tomorrow.</strong></span></div>
            <figcaption>Original illustration · Campus photography to follow</figcaption>
          </figure>
        </section>

        <section className="values-strip" aria-label="Our guiding values"><div className="page-shell values-inner"><span className="values-label">More than an education.<br /><strong>A foundation for life.</strong></span><span><ReaderIcon />Curiosity</span><span><HeartIcon />Character</span><span><GlobeIcon />Community</span><span><LightningBoltIcon />Possibility</span></div></section>

        <section id="our-school" className="section-space page-shell about-section" aria-labelledby="about-title">
          <div><span className="eyebrow">The Brainfield spirit</span><h2 id="about-title">Where determination<br />finds <em>direction.</em></h2></div>
          <div className="about-copy"><p className="lead-copy">Every child has a spark. Our story is about giving that spark room to grow.</p><p>At Brainfield Schools Lagos, our motto is simple: Determination and Focus. It speaks to learning with purpose, building character, and meeting each new challenge with a willingness to try.</p><p>From Salolo to Abule Egba, we share one name and one aspiration: to help young people think boldly and keep moving forward.</p><a href="#campuses" className="text-link">Find your Brainfield campus <ArrowTopRightIcon /></a></div>
        </section>

        <section id="academics" className="academic-section section-space" aria-labelledby="academic-title"><div className="page-shell">
          <div className="section-heading"><div><span className="eyebrow">Learning with purpose</span><h2 id="academic-title">A strong foundation.<br /><em>A wider horizon.</em></h2></div><p>Knowledge matters. So do the questions we ask, the ideas we explore, and the confidence we build along the way.</p></div>
          <div className="academic-grid">
            <article className="academic-feature"><span className="academic-number">01 / THE FOUNDATION</span><ReaderIcon className="academic-icon" /><h3>Learn to think.<br />Grow in confidence.</h3><p>Literacy, numeracy, scientific thinking, and communication form the building blocks of a purposeful education.</p><a href="#admissions" className="text-link">Ask about our academic programme <ArrowTopRightIcon /></a><div className="academic-pattern" aria-hidden="true"><span /><span /><span /><span /></div></article>
            <div className="academic-rows"><article><span>02</span><div><h3>Science & technology</h3><p>Questions that spark discovery. Skills that turn ideas into possibilities.</p></div><LightningBoltIcon /></article><article><span>03</span><div><h3>Language & expression</h3><p>Finding a voice through reading, writing, and thoughtful communication.</p></div><ReaderIcon /></article><article><span>04</span><div><h3>Character & connection</h3><p>Determination, focus, and respect for the people we learn alongside.</p></div><HeartIcon /></article></div>
          </div>
        </div></section>

        <section id="school-life" className="section-space page-shell" aria-labelledby="life-title"><div className="section-heading"><div><span className="eyebrow">Beyond the textbook</span><h2 id="life-title">Make room for<br /><em>“What if?”</em></h2></div><p>Discover the ideas behind our science and technology learning spaces. Ask the school about current facilities and arrange a visit.</p></div><LearningSpaces /></section>

        <section id="achievements" className="achievements-section section-space" aria-labelledby="achievements-title"><div className="page-shell">
          <div className="section-heading"><div><span className="eyebrow">The effort. The focus. The achievement.</span><h2 id="achievements-title">Small beginnings.<br /><em>National recognition.</em></h2></div><p>Celebrating publicly reported achievements by Brainfield students. Every story below links to its source.</p></div>
          <div className="achievement-layout"><article className="achievement-spotlight"><div className="award-emblem" aria-hidden="true"><StarIcon /><span>STEM</span></div><span className="eyebrow">{achievements[0].edition} · Winner</span><h3>{achievements[0].title}</h3><span className="achievement-person">{achievements[0].name}</span><p>{achievements[0].description}</p><a href={achievements[0].source} target="_blank" rel="noopener noreferrer" className="text-link">Read the Interswitch report <ArrowTopRightIcon /><span className="sr-only"> (opens in a new tab)</span></a></article>
            <div className="achievement-list">{achievements.slice(1).map(item => <article key={item.category}><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><p><strong>{item.name}.</strong> {item.description}</p><a href={item.source} target="_blank" rel="noopener noreferrer" className="text-link">Read the {item.sourceName} report <ArrowTopRightIcon /><span className="sr-only"> (opens in a new tab)</span></a></article>)}</div>
          </div>
          <article className="jamb-highlight"><div className="jamb-score"><strong>354<span>/400</span></strong><span>2022 UTME · Historical result</span></div><div><span className="eyebrow">A moment worth celebrating</span><h3>Determination, in numbers.</h3><p>PUNCH reported Dokun Jubril among the high scorers in the 2022 UTME, with 354 marks. A personal achievement, rather than a school-wide average.</p></div><a href="https://punchng.com/jamb-releases-cut-off-says-admission-ends-dec-31/" target="_blank" rel="noopener noreferrer" className="round-link" aria-label="Read PUNCH’s report of the 2022 UTME high scorers (opens in a new tab)"><ArrowTopRightIcon /></a></article>
        </div></section>

        <section id="campuses" className="section-space page-shell campuses-section" aria-labelledby="campus-title"><div className="section-heading"><div><span className="eyebrow">Find your community</span><h2 id="campus-title">Two campuses.<br /><em>One Brainfield.</em></h2></div><p>Come and get to know us. Speak with the school to plan your visit to either of our Lagos campuses.</p></div><div className="campus-grid">{campuses.map((campus, index) => <article key={campus.name} className="campus-card"><div className="campus-top"><span className="campus-index">0{index + 1}</span><span className="campus-label">{campus.label}</span><GlobeIcon /></div><h3>{campus.name}</h3><address>{campus.address}</address><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Brainfield Schools ${campus.address}`)}`} target="_blank" rel="noopener noreferrer" className="text-link">Find on Google Maps <ArrowTopRightIcon /><span className="sr-only"> (opens in a new tab)</span></a></article>)}</div></section>

        <section id="admissions" className="admissions-section" aria-labelledby="admissions-title"><div className="page-shell admissions-inner"><div><span className="eyebrow">Your child’s next chapter</span><h2 id="admissions-title">Let’s find out what<br /><em>the future holds.</em></h2><p>Have questions about admissions, school life, or visiting a campus? We’d love to help you take the next step.</p><a href="tel:+2348032367229" className="button button-white">Speak with the school <ArrowTopRightIcon /></a></div><div className="admissions-contact"><span className="contact-label">LET’S TALK</span>{school.phones.map(phone => <a key={phone} href={`tel:+234${phone.slice(1)}`}><MobileIcon />{phone.slice(0, 4)} {phone.slice(4, 7)} {phone.slice(7)}<ArrowTopRightIcon /></a>)}<p>Call to confirm current admissions, requirements, fees, and a convenient time to visit.</p><span className="admissions-note"><CheckIcon />Salolo & Abule Egba campuses</span></div></div></section>

        <section className="section-space page-shell faq-section" aria-labelledby="faq-title"><div><span className="eyebrow">A little more information</span><h2 id="faq-title">Good questions.<br /><em>A clear place to start.</em></h2></div><div className="faq-list">{faqs.map(item => <details key={item.question}><summary>{item.question}<ChevronDownIcon /></summary><p>{item.answer}</p></details>)}</div></section>
      </main>
      <footer className="site-footer"><div className="page-shell"><div className="footer-main"><div><Link href="/" aria-label="Brainfield Schools Lagos home"><Brand /></Link><p>Determination and Focus.<br />Salolo & Abule Egba, Lagos.</p></div><nav aria-label="Footer navigation"><a href="#our-school">Our school</a><a href="#academics">Academics</a><a href="#achievements">Achievements</a><a href="#campuses">Our campuses</a><Link href="/portal">School portal <ArrowTopRightIcon /></Link></nav><a href="#admissions" className="footer-cta">A brighter future<br /><em>starts with a conversation.</em><span>Get in touch <ArrowTopRightIcon /></span></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Brainfield Schools Lagos</span><span>Website preview · Campus artwork is illustrative</span><a href="#main-content">Back to top ↑</a></div></div></footer>
    </>
  );
}
