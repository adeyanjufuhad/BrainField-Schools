# BrainField Schools design guidance

Status: proposed design system; confirm school logo and brand assets during discovery.

## Visual direction

Use a trustworthy, calm school website and task-focused portals. The public site should lead with the actual school identity and approved photographs; portal pages should make daily actions easy to find. Use Geist Sans for interface text and Geist Mono sparingly for technical output. Use the same visual language across role-specific navigation.

The user's blue palette takes precedence over reference brands and generic skill colour restrictions: `#03045e`, `#023e8a`, `#0077b6`, `#0096c7`, `#00b4d8`, `#48cae4`, `#90e0ef`, `#ade8f4`, `#caf0f8`. Use deep navy for readable text and primary actions, near-white surfaces, and pale blues for selected states. Check actual foreground/background contrast; avoid small white text on cyan. Status labels must include text or icons, not colour alone.

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

Follow [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) and the installed Taste Skill's relevant typography, component-state, responsive-layout, and restraint guidance. School task clarity, accessibility, accurate data, and the blue palette override decorative suggestions. The existing RepoSpec product's layouts and branding are not school content.
