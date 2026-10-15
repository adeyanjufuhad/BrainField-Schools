import Link from "next/link";
import { ArrowRightIcon, ArrowTopRightIcon, CheckIcon, ChevronDownIcon, GlobeIcon, HeartIcon, LightningBoltIcon, MobileIcon, ReaderIcon } from "@radix-ui/react-icons";
import { Header } from "@/components/header";
import { FadeContent } from "@/components/fade-content";
import { LearningSpaces } from "@/components/learning-spaces";
import { Footer } from "@/components/footer";
import { AchievementPhoto } from "@/components/achievement-photo";
import { AwardsSlideshow } from "@/components/awards-slideshow";
import { ChampionVideo } from "@/components/champion-video";
import { Jamb2025 } from "@/components/jamb-2025";
import { campuses, faqs, school } from "@/content/school";
import { recentAchievements, championAchievement, championVideos, galleryHref } from "@/content/gallery";

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
            <div className="hero-actions"><a href="#admissions" className="button button-red">Discover Brainfield <ArrowTopRightIcon /></a><a href="#champions" className="hero-secondary">Meet our champions <ArrowRightIcon /></a></div>
            <div className="hero-location"><span className="location-dots"><span /><span /></span><a href="#campuses">Salolo–Alagbado</a><span className="location-separator" /><a href="#campuses">Abule Egba</a><span className="location-city">Lagos, Nigeria</span></div>
          </div>
          <AwardsSlideshow />
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

        <section id="school-life" className="section-space page-shell" aria-labelledby="life-title"><div className="section-heading"><div><span className="eyebrow">Beyond the textbook</span><h2 id="life-title">Make room for<br /><em>“What if?”</em></h2></div><p>Meet the students taking their curiosity beyond the classroom, from national science competitions to international opportunities.</p></div><FadeContent><LearningSpaces /></FadeContent></section>

        <section id="achievements" className="achievements-section section-space" aria-labelledby="achievements-title"><div className="page-shell">
          <div className="section-heading"><div><span className="eyebrow">The effort. The focus. The achievement.</span><h2 id="achievements-title">Bright minds.<br /><em>Bigger horizons.</em></h2></div><div className="section-heading-aside"><p>Recent publicly reported highlights, from international science opportunities to the national competition stage.</p><Link href={galleryHref("achievements")} className="text-link">Explore the achievement gallery <ArrowTopRightIcon /></Link></div></div>
          <div className="recent-stories">{recentAchievements.map(story => <article key={story.id} className="recent-story"><Link href={`/gallery?category=achievements&year=${story.year}`} aria-label={`Explore ${story.label}`}><AchievementPhoto id={story.id} theme={story.theme} /></Link><div className="recent-story-copy"><span className="eyebrow">{story.label}</span><h3>{story.title}</h3><p><strong>{story.student}.</strong> {story.description}</p><a href={story.source} target="_blank" rel="noopener noreferrer" className="text-link">Read the {story.sourceName} report <ArrowTopRightIcon /><span className="sr-only"> (opens in a new tab)</span></a></div></article>)}</div>
          <div className="champion-ribbon"><span className="ribbon-edition">INTERSWITCHSPAK 3.0</span><div><strong>{championAchievement.student} · National champion</strong><span>Celebrating a ₦7.5 million scholarship-winning achievement.</span></div><a href="#champions" className="text-link">Watch his story <ArrowTopRightIcon /></a></div>
        </div></section>

        <Jamb2025 />

        <section id="champions" className="champions-section section-space" aria-labelledby="champions-title"><div className="page-shell"><div className="section-heading"><div><span className="eyebrow">The people behind the achievement</span><h2 id="champions-title">Meet the mind.<br /><em>Watch the moment.</em></h2></div><Link href={galleryHref("videos")} className="text-link">More films in the Gallery <ArrowTopRightIcon /></Link></div><ChampionVideo video={championVideos[0]} featured /></div></section>

        <section id="campuses" className="section-space page-shell campuses-section" aria-labelledby="campus-title"><div className="section-heading"><div><span className="eyebrow">Find your community</span><h2 id="campus-title">Two campuses.<br /><em>One Brainfield.</em></h2></div><p>Come and get to know us. Speak with the school to plan your visit to either of our Lagos campuses.</p></div><div className="campus-grid">{campuses.map((campus, index) => <article key={campus.name} className="campus-card"><div className="campus-top"><span className="campus-index">0{index + 1}</span><span className="campus-label">{campus.label}</span><GlobeIcon /></div><h3>{campus.name}</h3><address>{campus.address}</address><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Brainfield Schools ${campus.address}`)}`} target="_blank" rel="noopener noreferrer" className="text-link">Find on Google Maps <ArrowTopRightIcon /><span className="sr-only"> (opens in a new tab)</span></a></article>)}</div></section>

        <section id="admissions" className="admissions-section" aria-labelledby="admissions-title"><div className="page-shell admissions-inner"><div><span className="eyebrow">Your child’s next chapter</span><h2 id="admissions-title">Let’s find out what<br /><em>the future holds.</em></h2><p>Have questions about admissions, school life, or visiting a campus? We’d love to help you take the next step.</p><a href="tel:+2348032367229" className="button button-white">Speak with the school <ArrowTopRightIcon /></a></div><div className="admissions-contact"><span className="contact-label">LET’S TALK</span>{school.phones.map(phone => <a key={phone} href={`tel:+234${phone.slice(1)}`}><MobileIcon />{phone.slice(0, 4)} {phone.slice(4, 7)} {phone.slice(7)}<ArrowTopRightIcon /></a>)}<p>Call to confirm current admissions, requirements, fees, and a convenient time to visit.</p><span className="admissions-note"><CheckIcon />Salolo & Abule Egba campuses</span></div></div></section>

        <section className="section-space page-shell faq-section" aria-labelledby="faq-title"><div><span className="eyebrow">A little more information</span><h2 id="faq-title">Good questions.<br /><em>A clear place to start.</em></h2></div><div className="faq-list">{faqs.map(item => <details key={item.question}><summary>{item.question}<ChevronDownIcon /></summary><p>{item.answer}</p></details>)}</div></section>
      </main>
      <Footer />
    </>
  );
}
