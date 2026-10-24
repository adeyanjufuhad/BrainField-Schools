-- Identity, explicit school role grants and academic structure.
-- An Auth account grants nothing: a person acts only through a linked, active profile,
-- an explicit role grant, or an academic assignment for the term.

create schema if not exists app;

create table app.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table app.profiles (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references app.schools,
  -- Neon Auth user id, set only by the school's provisioning process (never by self-service email matching).
  auth_user_id text unique,
  full_name text not null check (length(trim(full_name)) > 0),
  kind text not null check (kind in ('staff', 'student')),
  admission_number text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, school_id),
  unique (school_id, admission_number),
  check (kind = 'staff' or admission_number is not null)
);

create table app.role_grants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references app.profiles,
  role text not null check (role in ('administrator', 'principal', 'vp_admin', 'publisher', 'director')),
  granted_by uuid references app.profiles,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index role_grants_active on app.role_grants (profile_id, role) where revoked_at is null;

create table app.grading_policies (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references app.schools,
  name text not null,
  version integer not null default 1,
  ca_max numeric(5, 2) not null check (ca_max > 0),
  exam_max numeric(5, 2) not null check (exam_max > 0),
  pass_mark numeric(5, 2) not null,
  -- Ordered highest first: [{"grade": "A", "min": 70}, ...]
  bands jsonb not null,
  school_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (school_id, name, version)
);

create table app.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references app.schools,
  name text not null,
  unique (school_id, name)
);

create table app.terms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references app.schools,
  session_id uuid not null references app.academic_sessions,
  name text not null,
  ordinal smallint not null check (ordinal between 1 and 3),
  grading_policy_id uuid not null references app.grading_policies,
  is_current boolean not null default false,
  unique (session_id, ordinal)
);
create unique index terms_one_current on app.terms (school_id) where is_current;

create table app.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references app.schools,
  name text not null,
  unique (school_id, name)
);

create table app.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references app.schools,
  name text not null,
  unique (school_id, name)
);

create table app.enrolments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  student_id uuid not null,
  class_id uuid not null references app.classes,
  term_id uuid not null references app.terms,
  foreign key (student_id, school_id) references app.profiles (id, school_id),
  unique (student_id, term_id)
);
create index enrolments_class_term on app.enrolments (class_id, term_id);

create table app.subject_offerings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  class_id uuid not null references app.classes,
  subject_id uuid not null references app.subjects,
  term_id uuid not null references app.terms,
  teacher_id uuid not null,
  foreign key (teacher_id, school_id) references app.profiles (id, school_id),
  unique (class_id, subject_id, term_id)
);
create index subject_offerings_teacher on app.subject_offerings (teacher_id, term_id);

create table app.class_teachers (
  class_id uuid not null references app.classes,
  term_id uuid not null references app.terms,
  school_id uuid not null,
  teacher_id uuid not null,
  foreign key (teacher_id, school_id) references app.profiles (id, school_id),
  primary key (class_id, term_id)
);
