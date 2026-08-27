-- Paste this entire file into the Supabase SQL Editor and run it once to create all tables.

create extension if not exists pgcrypto;

-- Students table: student_id is the login "student ID", you choose it yourself, e.g. s001
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_id text unique not null,
  name text not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Courses table
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  teacher text,
  schedule text,
  created_at timestamptz default now()
);

-- Enrollments / report card entries: one student's grade in one course, for one month (period)
-- period is stored as 'YYYY-MM', e.g. '2026-08', so a student can have a
-- different grade for the same course in August vs. September.
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  period text not null,  -- e.g. "2026-08" — the report card month
  grade text,          -- e.g. "A" / "92", free text so it's easy to fill in by hand
  grade_percent numeric, -- optional: a percentage value, used for stats/sorting
  created_at timestamptz default now(),
  unique(student_id, course_id, period)
);

-- Assignments table: belongs to a course
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  due_date date,
  max_score numeric,
  created_at timestamptz default now()
);

-- Each student's completion/score for each assignment
create table if not exists assignment_scores (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  score numeric,
  status text default 'assigned' check (status in ('assigned','submitted','graded','missing')),
  feedback text,
  created_at timestamptz default now(),
  unique(assignment_id, student_id)
);

-- Note: all reads/writes in this project go through the server-side API
-- (using the Service Role Key); the browser never talks to Supabase directly,
-- so Row Level Security policies are not required here.
-- If you later want the browser to connect to Supabase directly, be sure to
-- enable RLS and write the corresponding policies.
