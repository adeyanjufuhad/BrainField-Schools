# School portal: accounts and results (first vertical slice)

Implemented 24 October 2026 on the Neon `development` branch with synthetic data only. This covers Build Guide Milestone A (sign-in, school roles, academic structure) and the core of Milestone B (results approval workflow and director dashboard). No real student data has been imported.

## What works

| Person | Workspace | What they can do |
| --- | --- | --- |
| Subject teacher | My score sheets | Enter CA and exam scores per student (or mark absent/exempt), save drafts, submit a complete sheet. Edit again only if a reviewer returns it. |
| Class teacher | Class results | Review other teachers' submitted sheets, accept or return with a written reason, see compiled totals, approve the class once every sheet is accepted. |
| VP Administration | Class results | Independently review a class teacher's own subject sheet; give final approval or return the class with a reason. Approval does not publish. |
| Publisher (granted role) | Class results | Publish VP-approved results. Publishing freezes a report-card snapshot per student. |
| Student | My results | See only their own published report cards; print or save as PDF. |
| Director / principal | Director dashboard | Published statistics only, filterable by class and subject via the URL: average, pass rate with denominators, grade distribution, last publication time. Classes still in review appear only as stage counts. |

Every transition is recorded in an append-only history shown on the sheet and class pages. Learning progress reports remain excluded.

## How access is enforced

- **Auth grants nothing on its own.** A Neon Auth account maps to a school profile only through `profiles.auth_user_id`, set by the school's provisioning process. There is no matching by email, because Neon Auth does not verify email addresses on this branch. Unlinked or deactivated accounts see an "account not ready" page.
- **Server-side identity.** Every page and server action derives the person from the session. Forms send only record IDs and the user's change.
- **Database-enforced workflow.** The web app connects as `brainfield_app`. That role can read school tables and call six workflow functions, but it cannot insert, update or delete any table, create roles, or bypass row security. The functions (`db/migrations/0003_workflow_functions.sql`) lock the row, check the caller's role or assignment, the state and the expected version, and write the audit event in one transaction.
- **Independent review.** No one accepts, returns or gives final approval on their own work. The VP reviews a class teacher's own subject sheet, and a VP who is the class teacher cannot give that class final approval.
- **Concurrency.** Each sheet and class carries a version. Stale saves or approvals fail with "changed in another window — reload".
- **Integrity.** Class approval records the exact sheet revisions. Final approval and publication refuse to proceed if any sheet changed afterwards.

`tests/portal-database.spec.ts` calls the database directly as the application role to prove these refusals hold without the UI.

## Local setup (development only)

```bash
cd apps/web
npm run db:migrate      # applies db/migrations and creates the restricted brainfield_app role
npm run db:seed         # synthetic school, class, subjects, staff and students; writes .dev-accounts.local.json
npm run dev             # http://localhost:3001/portal
npm run db:reset-demo   # returns the demo class to blank draft sheets (refuses on non-demo data)
```

`apps/web/.env.local` holds `DATABASE_OWNER_URL` (migrations and seeding only), `DATABASE_URL` (the restricted app role), `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`. Both `.env.local` and `.dev-accounts.local.json` are gitignored. Use `localhost`, not `127.0.0.1`: Neon Auth only trusts localhost origins on this branch.

Neon project: `brainfield-schools` (`patient-glade-48656206`, AWS London), branch `development`.

## Placeholders awaiting school decisions

- **Grading policy.** "Example policy (awaiting school approval)" uses CA 40 + exam 60, pass mark 40, and A/B/C/D/E/F bands at 70/60/50/45/40. Every screen and report card labels it as a placeholder. Replace it with the school's approved, versioned policy. No positions or rankings are calculated until a tie policy is agreed.
- **Who publishes.** The demo principal holds a separate `publisher` grant (decision register: named publication permission).
- **Director scope.** Published results only, with pending stages shown as counts (decision register default).

## Not built yet

- An administrator UI for staff invitations, student accounts without email, classes, terms and role grants (currently `scripts/db-seed.mjs` only).
- Corrections after publication (a new revision through the same approvals). The schema supports revisions and superseding; the amendment flow is not built.
- CSV score import, row-level security policies as a second layer, MFA for privileged staff, and Vercel environment configuration (production uses no database yet).

## Before any real data

- In the Neon console, disable public sign-up and the shared Google provider for this Auth project.
- Use a separate production project and branch.
- Agree retention and backup.
- Add the deployed site's origin to Neon Auth's trusted domains.
