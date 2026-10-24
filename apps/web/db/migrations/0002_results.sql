-- Subject sheets hold a teacher's scores; class batches compile accepted sheets for approval and publication.
-- Sheet states: draft -> submitted -> accepted | returned (-> resubmitted).
-- Batch states: compiling -> class_approved -> vp_approved -> published, with returned from VP.

create table app.subject_sheets (
  id uuid primary key default gen_random_uuid(),
  offering_id uuid not null unique references app.subject_offerings,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'returned', 'accepted')),
  -- revision counts submissions; version guards concurrent edits and transitions.
  revision integer not null default 1,
  version integer not null default 1,
  return_reason text,
  submitted_at timestamptz,
  accepted_by uuid references app.profiles,
  accepted_at timestamptz,
  updated_at timestamptz not null default now()
);

create table app.scores (
  sheet_id uuid not null references app.subject_sheets,
  enrolment_id uuid not null references app.enrolments,
  ca numeric(5, 2) check (ca >= 0),
  exam numeric(5, 2) check (exam >= 0),
  attendance text not null default 'present' check (attendance in ('present', 'absent', 'exempt')),
  updated_by uuid not null references app.profiles,
  updated_at timestamptz not null default now(),
  primary key (sheet_id, enrolment_id)
);

create table app.result_batches (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references app.schools,
  class_id uuid not null references app.classes,
  term_id uuid not null references app.terms,
  status text not null default 'compiling' check (status in ('compiling', 'class_approved', 'returned', 'vp_approved', 'published')),
  version integer not null default 1,
  return_reason text,
  updated_at timestamptz not null default now(),
  unique (class_id, term_id)
);

-- The exact sheet revisions a class approval covered.
create table app.batch_sheets (
  batch_id uuid not null references app.result_batches,
  sheet_id uuid not null references app.subject_sheets,
  revision integer not null,
  primary key (batch_id, sheet_id)
);

-- Append-only audit of every workflow transition.
create table app.workflow_events (
  id bigint generated always as identity primary key,
  school_id uuid not null references app.schools,
  batch_id uuid references app.result_batches,
  sheet_id uuid references app.subject_sheets,
  actor_id uuid not null references app.profiles,
  action text not null,
  reason text,
  revision integer,
  created_at timestamptz not null default now(),
  check (batch_id is not null or sheet_id is not null)
);
create index workflow_events_batch on app.workflow_events (batch_id, created_at);
create index workflow_events_sheet on app.workflow_events (sheet_id, created_at);

-- Frozen report-card snapshots. A correction adds a new revision and supersedes the old one.
create table app.published_reports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references app.schools,
  batch_id uuid not null references app.result_batches,
  enrolment_id uuid not null references app.enrolments,
  student_id uuid not null references app.profiles,
  class_id uuid not null references app.classes,
  term_id uuid not null references app.terms,
  revision integer not null,
  grading_policy_id uuid not null references app.grading_policies,
  snapshot jsonb not null,
  published_by uuid not null references app.profiles,
  published_at timestamptz not null default now(),
  superseded_at timestamptz,
  unique (enrolment_id, revision)
);
create unique index published_reports_current on app.published_reports (enrolment_id) where superseded_at is null;
create index published_reports_student on app.published_reports (student_id, published_at desc);
