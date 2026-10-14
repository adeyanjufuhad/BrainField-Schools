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

## Dependency assessment

The production-dependency audit reported no vulnerabilities at verification. The full audit reported five high-severity entries in the development-only ESLint/fast-glob/micromatch/braces chain, originating from one unpatched braces advisory. The registry's current braces release was 3.0.3; no compatible patched release was available. The suggested automatic downgrade of Next.js lint tooling was not applied. This tooling does not process visitor input or ship as a production runtime dependency; revisit the advisory before upgrading or running lint on untrusted source patterns.

The Neon Auth package is pinned to a beta release. No real Neon session, database query, migration, invitation, recovery, or role-authorization flow has been exercised because an authorised Neon environment is not connected. Those need a separate integration acceptance gate.

## Remaining content/launch work

School-approved campus photographs, academic/facility particulars, admission dates/requirements, final copy approval, and permission to feature historical student highlights remain to be confirmed. The supplied logo and contacts are incorporated. Search indexing remains disabled for this preview. There is no production deployment, real student-data import, or live payment integration.
