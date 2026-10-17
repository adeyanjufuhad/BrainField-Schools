# BrainField Schools design guidance

Status: landing-page design implemented; founder-supplied school logo is in use. Verified public event photographs now feature Brainfield students. Current classroom and campus photographs remain pending.

## Visual direction

Use a trustworthy, calm school website and task-focused portals. The public site should lead with the actual school identity and approved photographs; portal pages should make daily actions easy to find. Use locally hosted Outfit for interface text and Newsreader for public-site editorial headings. Use sans-serif typography in future academic dashboards. Use the same visual language across role-specific navigation.

The founder's confirmed palette is `#386641` (forest green), `#6a994e` (leaf green), `#a7c957` (lime), `#d00000` (red), and `#ffffff` (white). This supersedes the earlier blue palette. Use forest green for readable text and navigation, lime/light green for decorative surfaces, red for key actions, and white for breathing room. Derived pale green surfaces are allowed. Preserve the supplied logo artwork without recolouring it. Avoid small white text on leaf/lime green; check actual contrast. Status labels require text/icons in addition to colour.

## Layout and interaction

- Public pages: clear hierarchy, editorial content, genuine facilities/awards, and obvious contact/admissions actions. Do not fabricate results or testimonials.
- Portals: compact desktop sidebar and accessible mobile navigation. Present tables for academic records, with usable small-screen alternatives.
- Director: filters for session, term, class, and subject; show denominator, publication status, and last refresh time beside statistics.
- Teacher: score grid with keyboard navigation, validation, clear save state, and submitted/locked rows.
- Student: upcoming tasks, current timetable, own published results, and bills. Do not insert removed learning progress reports.
- Use 4px spacing increments, 8px control corners, 12px panel corners, and at least 44px touch targets.
- Give forms visible labels, helpful errors, retained input on failure, and explicit success confirmation.
- Include loading, empty, error, offline, read-only, returned, approved, and published states.
- Preserve meaningful filters in the URL. Warn before losing unsaved changes.
- Avoid perpetual animation in academic workflows. Honour reduced motion and give users control over any automatic public-site animation.

## Accessibility and performance

Target WCAG 2.2 AA as an implementation goal, verified through review rather than claimed automatically. Include semantic landmarks, a skip link, visible focus, keyboard operation, labelled dialogs, accessible charts with tables, zoom support, and contrast checks. Optimise photographs, paginate large result tables, defer editor/chart bundles, and test low-end phones and the school's actual lab computers.

## References and precedence

Follow [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) and the installed Taste Skill's relevant typography, component-state, responsive-layout, and restraint guidance. School task clarity, accessibility, accurate data, and the founder-selected green/red/white palette override decorative suggestions. The existing RepoSpec product's layouts and branding are not school content.


## Landing-page content

Give Salolo and Abule Egba equal-size campus cards; label Salolo as main campus. Use the supplied logo unchanged. Contact links use the three founder-provided numbers. Historical achievements require nearby source links and dates/editions; individual UTME scores must not appear as school averages. The hero and student stories use verified, source-attributed event photographs; do not imply they show a campus or classroom. Keep draft academic/facility copy non-specific until approved. See docs/CONTENT-SOURCES.md.

## Gallery and editorial refresh

The Pinterest and web references in docs/LANDING-RESEARCH.md inform a clearer editorial hierarchy, proof-led hero panels, distinct recent-story layouts, and a dedicated Gallery. The Gallery navigation leads to /gallery, with category/year/search filters represented in the URL. Source/year labels remain visible. Video posters combine the credited Interswitch champion photograph with typography, and official YouTube media loads only after the visitor chooses to play. Keep a direct YouTube fallback.

The homepage highlights recent science stories and school-published 2025 UTME highlights. Attribute the individual results and posters to their source. Historical 2022 results remain dated in the archive; do not imply a complete private cohort database.


## School photographs and slideshow

The hero uses a simple image-only slideshow of 17 real competition photos and results posters. Images change every six seconds with gentle 4.5% magnification. Full originals remain available in the Gallery. There is no carousel card, large caption, arrow control or dot selector. A compact inset range slider and image counter identify the slideshow and allow direct image selection; no play/pause button is shown. Hover/focus and background tabs suspend advancement. Reduced-motion preference disables autoplay, magnification and fading; manual slider selection remains available.

The School photos Gallery contains 18 selected source-linked originals, with year/search filters, credits and full-size links. The dated admissions/awards flyer is available only in the archive. Preserve descriptive alt text and accurate mixed-school delegation captions. Never substitute an older champion photo for a different student. Current classroom and campus photographs remain pending.

The 2025 results section shows school-reported 364/400 highlights for Babalola David and Ayomide Victoria. Public results posters provide the source; no full JAMB slips or private identifiers are exported. Provenance is documented in docs/SCHOOL-MEDIA.md.

React Bits FadeContent provides a restrained, once-only reveal on photo/story sections, respecting reduced motion and preserving readable server-rendered content. See docs/REACT-BITS.md and the complete third-party licence.

Current motion update, 15 October 2026: the hero play/pause button is removed at the founder’s request. A compact inset range slider and image counter identify the slideshow and allow direct selection. Images slowly magnify by 4.5% over six seconds; hover/focus pauses advancement and magnification. Source originals remain accessible in the Gallery. Homepage headings, academic blocks, achievement stories, result panels, campus cards, admissions and FAQ content reveal once with a 28px rise and fade. Reduced-motion preference disables autoplay, magnification and reveals while preserving manual image selection.

## Public website revamp

Use a forest-green split hero with a white photo inset, gentle slideshow zoom and compact slider. A linked proof strip leads to the dated 2025 results and achievement archive. Alternate white, pale green and forest sections with editorial typography, staggered achievement stories and equal campus panels. The Gallery opens with a real EKO STEM photo and uses clearly grouped category/search filters. The footer uses the original crest on forest green. The portal remains an honest availability page with planned workspace descriptions; do not imply authentication or dashboards are live. Mobile layouts collapse to one column. Preserve source links, original images, reduced-motion support and verified school information.

Latest slideshow refinement: images now advance every three seconds. Remove the inset slider and counter entirely so results posters remain unobstructed. Retain the matching three-second zoom, hover/focus pause, reduced-motion support and link to the full photo Gallery. This supersedes the earlier slider and six-second timing guidance.

## Landing page refinement (17 October 2026)

- One consolidated stylesheet replaces the earlier base-plus-override layers. Minimum text size is 12px; body copy is 15–17px. Small text uses forest or muted green, never leaf/lime, to keep 4.5:1 contrast.
- The hero merges the old proof strip into three linked facts (364/400 2025 UTME, ₦7.5m InterswitchSPAK 3.0 prize, two campuses). The generic values strip is removed; the motto appears in a crest card in "Our school".
- The slideshow keeps its unobstructed image, three-second timing, zoom and hover/focus pause. A small caption and photo credit sit below the image, with a thin progress line; both are hidden or static under reduced motion.
- "School life" is a five-photo competition mosaic (EKO STEM and BOAB) instead of tabs that repeated the Sakura and Interswitch stories shown in Achievements. Its note states that some group photos include students from other schools.
- The 2025 JAMB board shows each school-published subject score as a labelled bar beside the 364/400 total.
- The FAQ has a call card, the footer lists both campuses and all three phone numbers, and the utility bar links to the main phone number.
