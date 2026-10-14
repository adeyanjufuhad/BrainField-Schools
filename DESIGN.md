# BrainField Schools design guidance

Status: landing-page design implemented; founder-supplied school logo is in use. School photographs remain pending.

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

Give Salolo and Abule Egba equal-size campus cards; label Salolo as main campus. Use the supplied logo unchanged. Contact links use the three founder-provided numbers. Historical achievements require nearby source links and dates/editions; individual UTME scores must not appear as school averages. Original campus artwork is explicitly illustrative. Keep draft academic/facility copy non-specific until approved. See docs/CONTENT-SOURCES.md.
