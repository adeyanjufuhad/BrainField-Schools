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
npm run db:seed-admin   # adds the demo administrator to an already-seeded database
npm run dev             # http://localhost:3001/portal
npm run db:reset-demo   # returns the demo class to blank draft sheets (refuses on non-demo data)
```

`apps/web/.env.local` holds `DATABASE_OWNER_URL` (migrations and seeding only), `DATABASE_URL` (the restricted app role), `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`. Both `.env.local` and `.dev-accounts.local.json` are gitignored. Use `localhost`, not `127.0.0.1`: Neon Auth only trusts localhost origins on this branch.

Neon project: `brainfield-schools` (`patient-glade-48656206`, AWS London), branch `development`.


## Administrator workspace

An `administrator` grant opens **School setup** and **People**. Administrators manage the school's structure and access; they get no academic authority (no score entry, review, approval or publication), and the database refuses those calls for them.

| Screen | What an administrator can do |
| --- | --- |
| School setup | Add classes and subjects, assign the class teacher, and assign a subject teacher per class (which opens that class's score sheet). Sheets that are submitted or accepted, and classes whose results are approved, are locked against reassignment. |
| People | Add staff and students, create their sign-ins, enrol students in a class for the current term, grant or revoke roles (principal, VP Administration, publisher, director, administrator), and remove or restore access. A recent-changes list shows the audit trail. |

Rules enforced in `db/migrations/0005_administration.sql`:

- Every admin function checks the caller's `administrator` grant and writes an `app.admin_events` row; `brainfield_app` cannot write that table directly.
- An administrator cannot deactivate themselves or remove their own administrator role.
- Roles can only be granted to staff, never students. Removing access takes effect on the person's next page load ("This account has been deactivated by the school").
- Account linking (`admin_link_account`) refuses to re-link a profile that already has a sign-in.

### Sign-ins and students without email

- Staff sign in with their email address.
- Students need no email. They sign in with their **admission number**, which is mapped to a non-routable address (`{admission}@students.brainfield.invalid`) behind the scenes.
- When an administrator creates a sign-in, the app creates the Neon Auth account server-side and shows a generated temporary password (`xxxx-xxxx-xxxx-xxxx`, no look-alike characters) **once**, with a copy button. It is never stored or logged. Hand it over in person, and expect people to change it once password change is built.
- The Neon Auth account is linked to the profile by ID at creation time, never by email.

`npm run db:seed-admin` adds the demo administrator to an existing demo database (and `.dev-accounts.local.json`); `npm run db:seed` includes it for a fresh one. Both refuse to run against a non-demo database. `tests/portal-admin.spec.ts` covers access control, creating a class, subject, teacher and student, signing in as the new people, and removing access.

## Placeholders awaiting school decisions

- **Grading policy.** "Example policy (awaiting school approval)" uses CA 40 + exam 60, pass mark 40, and A/B/C/D/E/F bands at 70/60/50/45/40. Every screen and report card labels it as a placeholder. Replace it with the school's approved, versioned policy. No positions or rankings are calculated until a tie policy is agreed.
- **Who publishes.** The demo principal holds a separate `publisher` grant (decision register: named publication permission).
- **Director scope.** Published results only, with pending stages shown as counts (decision register default).

## Not built yet

- Terms and sessions management, bulk student import, and password change or reset (administrators currently hand over a temporary password; people cannot change it yet).
- Corrections after publication (a new revision through the same approvals). The schema supports revisions and superseding; the amendment flow is not built.
- CSV score import, row-level security policies as a second layer, MFA for privileged staff, and Vercel environment configuration (production uses no database yet).

## Before any real data

- In the Neon console, disable public sign-up and the shared Google provider for this Auth project.
- Use a separate production project and branch.
- Agree retention and backup.
- Add the deployed site's origin to Neon Auth's trusted domains.
