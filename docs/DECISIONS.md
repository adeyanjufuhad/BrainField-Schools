# Decision register

Updated 14 October 2026. Confirmed means stated by the founders in the planning conversation. Proposed means recommended in these documents and still open to review.

## Confirmed

| ID | Decision |
| --- | --- |
| C01 | Build a platform for the founders' former Nigerian secondary school. |
| C02 | Include the public website, student/teacher/admin portals, CBT, school/study timetables, results, assignments, competition selection/practice, ICT notes, programming classroom, and fee/bill payments. |
| C03 | Remove learning progress reports. |
| C04 | Subject teachers submit scores to the class teacher. Class teacher approves compiled results, then VP Administration provides final approval. |
| C05 | Director has a separate dashboard for result viewing and statistics. |
| C06 | Create a public GitHub repository named BrainField-Schools, with a comprehensive README, architecture in Mermaid, architecture PDF, and build guide. |
| C07 | Document first; the founder has now authorised landing-page implementation. |
| C08 | Use #386641, #6a994e, #a7c957, #d00000, and #ffffff. This supersedes the earlier blue palette. |
| C09 | Use Neon PostgreSQL and Neon Auth. |
| C10 | Brainfield Schools Lagos; motto: Determination and Focus. Two campuses: Salolo main campus and Abule Egba, with equal visual prominence. |
| C11 | Use the founder-supplied school logo and three supplied phone numbers. |
| C12 | Research public achievements and publish source-linked historical highlights. |

## Proposed technical decisions

| ID | Proposal | Reason |
| --- | --- | --- |
| P01 | Next.js modular monolith with TypeScript | Manageable for two developers |
| P02 | Neon PostgreSQL and Neon Auth are confirmed; private object storage remains to be selected | Founder-selected providers |
| P03 | Server permission checks plus RLS | Defence against cross-user and cross-class access |
| P04 | Atomic database functions for critical transitions | Approval/payment integrity under retries and concurrency |
| P05 | Separate publication action after VP approval | Prevent accidental release |
| P06 | Published result revisions are immutable | Preserve trust and correction history |
| P07 | Director metrics default to published data | Avoid presenting draft performance as final |
| P08 | Paystack hosted checkout in school's merchant account | Separate payment collection from developers |
| P09 | Browser practice runner on separate origin | Keep student code away from portal credentials |
| P10 | Vercel plus Neon; bounded job worker | Simple deployment, expanded only when needed |
| P11 | Academic MVP before advanced modules | Validate core value early |
| P12 | No open-source licence initially | Preserve ownership discussion before sale/build |

## Questions and proposed defaults

| Question | Decision owner | Proposed starting position |
| --- | --- | --- |
| Enrolment and peak CBT candidates? | School leadership / ICT lead | Measure actual cohort and lab capacity before sizing |
| Who publishes VP-approved results? | Principal / VP Admin | Named publication permission |
| Can director view pending results? | Director / principal | Published performance metrics; pending status counts only |
| Who reviews a class teacher's own subject sheet? | VP Admin | Appointed independent reviewer |
| Who acts when an approver is absent? | Principal | Time-bounded, audited delegation |
| Grade bands, weights, rounding, absence, ranking? | Academic leadership | Configurable, versioned policy based on current school practice |
| Correction and publication deadlines? | VP Admin | New revision and repeated approval for corrections |
| Fee instalments, refunds, scholarships, penalties? | Finance / proprietor | No assumptions until documented |
| Staff/student login and recovery without email? | School administration / ICT lead | Invite-controlled staff; school-approved student identity process |
| Programming languages and devices? | ICT teacher | Begin with browser web exercises; evaluate Python separately |
| Parent access, attendance, admissions, library? | School leadership | Optional, separately prioritised |
| Public use of student results/photos? | School leadership / data adviser | Approved publication process and minimum personal data |
| Retention, privacy obligations, and provider locations? | School / qualified adviser | Document and review before importing real data |
| Recovery expectations and support hours? | School / developers | Agree measurable targets and fund suitable backups |
| Code ownership, reuse, licence, and source access? | Both founders / school | Agree before implementation contract |
| Infrastructure account ownership and renewal costs? | Proprietor / developers | School-owned production accounts with delegated developer access |
| Final price and milestone scope? | Founders / school | Estimate after discovery; separate development and recurring costs |

Record each resolution with date, approver, rationale, and affected documents. Revisit estimates when scope changes.

## Implementation defaults, 24 October 2026

These defaults apply to the development portal slice until the school decides otherwise. See [PORTAL.md](PORTAL.md).

| Item | Default used | Owner to confirm |
| --- | --- | --- |
| Reviewer for a class teacher's own subject sheet | VP Administration | VP Admin |
| Publisher | Separate `publisher` grant (demo principal) | Principal / VP Admin |
| Director access | Published statistics; pending stages as counts only | Director / principal |
| Grading | Labelled example policy: CA 40 + exam 60, pass 40, A–F bands; no rankings | Academic leadership |
| Account linking | Provisioning sets the Auth user ID; no email matching | School administration / ICT lead |
