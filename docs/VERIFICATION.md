# Landing-page verification

Verified locally on 14 October 2026 with Node.js 22.14, Next.js 16.4.0, React 19.3.0, and the committed package lockfile.

## Checks

- Production compilation and TypeScript checking passed.
- ESLint passed after correcting its configuration warning.
- Browser suite: 11 passed, one intentionally skipped desktop copy of the mobile-menu test.
- Desktop Chrome and Pixel 7 browser emulation cover school identity, original logo display, equal campus-card widths, supplied contact numbers, source links, historical UTME labelling, keyboard tabs, FAQs, portal availability, mobile menu behaviour, and horizontal overflow.
- Automated axe WCAG A/AA checks passed on both tested viewports after adjusting small-text contrast. These checks are not a complete accessibility certification or a substitute for real-device and assistive-technology review.
- Unconfigured Neon Auth returns HTTP 503 and no-store; it does not accept fake accounts or claim a live connection.
- Documentation links, seven Mermaid source/render pairs, and PDF content checks passed. PDFs were regenerated for Neon and the green/red/white palette.

## Gallery refresh verification — 14 October 2026

- Production build, ESLint, standalone TypeScript checks, and document checks passed after the Gallery refresh.
- Updated browser suite: 23 passed, one intentionally skipped desktop copy of the mobile-menu test. Tests cover category/year/search filters, URL persistence, navigation, no-match reset, historical result labels, the missing 2025 results state, video controls and fallback links, and automated accessibility on both viewports.
- Reviewed homepage and Gallery screenshots at desktop and mobile sizes; no horizontal overflow was detected. Both campus cards retain equal prominence.
- YouTube integration tests stub the external iframe response. They verify click-to-load behaviour, the official video ID, accessible title, close control, and direct YouTube fallback; they do not certify unrestricted third-party playback.
- The 2025 JAMB list remains unavailable. No student scores were invented. See [research and source notes](LANDING-RESEARCH.md).

## Real-photo update — 15 October 2026

The conceptual hero and learning-space illustrations were replaced with two verified public event photographs. Homepage achievement cards, relevant Gallery cards and champion video posters also use the sourced photographs. [Photograph provenance](PHOTO-SOURCES.md) records the original publishers, URLs, identity checks and contextual limitations.

Production build, ESLint, TypeScript and documentation checks passed. All 23 applicable desktop/mobile browser checks passed across the suite and the targeted rerun after correcting an ambiguous photo-test selector; the desktop copy of the mobile-menu check remains intentionally skipped. Tests now verify actual image decoding, source captions, correct alt text, keyboard photo-tab selection and the absence of the conceptual hero image. Accessibility checks passed for the homepage and Gallery on both viewports.

## Awards and results carousel — 15 October 2026

The homepage hero now has six manual slides: five verified achievement records and the published 2022 individual UTME result. Two slides use the verified event photographs; records without an attributable photograph use labelled award/score cards. Each slide retains its source and edition/year. No 2025 JAMB results have been invented.

Production build and ESLint passed. The updated desktop/mobile browser suite passed 25 checks, with one intentional desktop skip for the mobile-only menu check. Carousel coverage includes next/previous controls, selectors, keyboard arrows, wraparound, the historical score label, source links, horizontal overflow and automated accessibility. Publication was initially held by automatic approval review; the founder explicitly approved the selected 18 photos on 15 October 2026.

## Dependency assessment

The production-dependency audit reported no vulnerabilities at verification. The full audit reported five high-severity entries in the development-only ESLint/fast-glob/micromatch/braces chain, originating from one unpatched braces advisory. The registry's current braces release was 3.0.3; no compatible patched release was available. The suggested automatic downgrade of Next.js lint tooling was not applied. This tooling does not process visitor input or ship as a production runtime dependency; revisit the advisory before upgrading or running lint on untrusted source patterns.

The Neon Auth package is pinned to a beta release. No real Neon session, database query, migration, invitation, recovery, or role-authorization flow has been exercised because an authorised Neon environment is not connected. Those need a separate integration acceptance gate.

## Remaining content/launch work

School-approved campus photographs, academic/facility particulars, admission dates/requirements, final copy approval remain to be confirmed. The founder approved the selected competition photos and public results posters for GitHub publication. The supplied logo and contacts are incorporated. Search indexing remains disabled for this preview. There is no production deployment, real student-data import, or live payment integration.

## Uploaded photo archive and React Bits — 15 October 2026

The completed local update contains 18 source-linked photographs and a 17-slide manual carousel. Production build (including TypeScript), ESLint, document validation and git diff whitespace checks passed. The final desktop/mobile Playwright run passed 29 checks, with one intentional desktop skip for mobile navigation. Coverage includes source-linked 2025 results, photo filters, full-size links, carousel selectors, arrows, wraparound, responsive overflow, reduced motion and automated WCAG A/AA checks. Desktop and mobile screenshots were visually reviewed. Both excluded full JAMB-slip originals were hash-checked against the 18 exported assets: zero matches. A local ZIP contains only the selected public photo assets and their provenance document. The founder explicitly approved public GitHub publication of the selected 18 photos on 15 October 2026.


## Image-only slideshow — 15 October 2026

The founder requested removal of the carousel presentation. The final hero has 17 uncropped images rotating every six seconds, a small pause control and no arrows, dots or large caption panel. Source attribution remains in the Gallery and accessible figure descriptions. Production build and ESLint passed. Final browser suite: 31 passed, one intentional desktop skip for the mobile-only menu check. Tests verify automatic advancement, pause/resume, reduced-motion static behaviour, source content, responsive layout, Gallery filters and automated accessibility. The complete React Bits licence was restored during the publication review. The founder explicitly authorised publishing the selected 18 photos and website changes to the public repository.

## Slideshow magnification and page scroll reveals — 15 October 2026

Removed the hero play/pause button at the founder request. Added an inset native range slider and image counter, plus a gentle 4.5% zoom over each six-second image interval. Hover and keyboard focus pause advancement and magnification. Reduced motion disables autoplay and animation while leaving manual slider selection available. One native IntersectionObserver applies once-only GSAP rise/fade reveals to homepage headings, academic blocks, achievement stories, results, campuses, admissions and FAQs; observers and tweens are cleaned up. Server-rendered content stays visible without JavaScript.

Production build and TypeScript, ESLint and documentation checks passed. Browser suite: 33 passed, one intentional desktop skip for mobile navigation. Tests cover automatic image advancement, slider selection, focus pause, reduced motion, readable completed scroll reveals, Gallery content and automated WCAG checks on desktop/mobile. A separate visual check confirmed an actual image scale above 1.005 and saved desktop/mobile previews. No photo assets or school result records changed in this update.

## Public website revamp — 15 October 2026

Redesigned the homepage, Gallery introduction and filters, shared header/footer, campus and admissions sections, and portal availability page. The homepage now uses a forest-green split hero, real-photo inset, linked 2025 UTME highlights, staggered achievement stories and distinct section surfaces. The mobile menu includes a portal link. Source data, image archive and authentication availability remain unchanged.

Production build, TypeScript, ESLint and document checks passed. The full browser run passed all 16 Gallery checks and 16 of 17 applicable landing checks; the remaining desktop contrast issue occurred while text faded during scroll. Scroll reveals now keep text fully opaque while translating, preserving contrast. All 17 applicable landing checks then passed on the final build, with one intentional desktop skip for mobile navigation. Thus all 33 applicable checks passed across the full run and focused rerun. Desktop and 360px mobile visual checks covered home, Gallery and portal, with image decoding and no horizontal overflow. Architecture documents were unaffected.

## Faster unobstructed slideshow — 15 October 2026

Removed the inset range slider and image counter. Images now change every three seconds, with matching zoom duration, hover/focus pause and reduced-motion support. Production build, TypeScript and ESLint passed. All 17 applicable landing checks passed, with one intentional desktop skip. Refreshed the existing browser preview, confirmed zero slider controls and no browser JavaScript errors, and checked mobile navigation. Desktop and 360px mobile reviews of home, Gallery and portal passed image decoding and horizontal overflow checks. Source photos and result data were unchanged.

## Dependency audit after adding Neon Auth — 30 October 2026

`npm audit` in `apps/web` reported 10 advisories, all arriving through `@neondatabase/auth@0.6.0-beta` (0.7.0-beta, the newest release, still pins the same versions).

- **Fixed: `zod` (high, memory exhaustion on oversized collections).** The SDK pins `zod@4.5.4`, so `npm audit fix` could not move it. `package.json` now has an `overrides` entry for `zod` 4.6.7. Typecheck, lint, the production build and the full Playwright suite (real Neon sign-in, admin and results workflows) pass with it. Remove the override once the SDK ships a fixed `zod`.
- **Open: `@better-auth/drizzle-adapter` (low, rate limits can be exceeded under concurrent requests on PostgreSQL).** No patched 1.7.x release exists (only 1.8 betas). It applies to a self-hosted better-auth server using its own Drizzle/PostgreSQL rate limiter; this app uses Neon's hosted Auth through the SDK's server client and does not run that code path.
- **Open: `deepmerge` prototype poisoning, reached through `html-to-text` → `@react-email/*` → `@daveyplate/better-auth-ui` → `@neondatabase/auth-ui`.** The latest `deepmerge` (4.3.1) is affected and has no fix. The app imports none of the Auth UI or email-rendering packages, so the code is installed but not used.

Revisit when the Neon Auth SDK leaves beta or publishes a release with updated `better-auth`.
