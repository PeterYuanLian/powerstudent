-- Run this once in the Supabase SQL Editor to upgrade an EXISTING database
-- (one that was set up before monthly report cards existed).
-- If you are setting up a brand new database instead, just use
-- supabase-schema.sql — it already includes this.

-- 1. Add the "period" column (the report card month, e.g. "2026-08")
alter table enrollments add column if not exists period text;

-- 2. Backfill any existing grades with the current month, so nothing breaks
update enrollments set period = to_char(now(), 'YYYY-MM') where period is null;

-- 3. Make it required going forward
alter table enrollments alter column period set not null;

-- 4. Replace the old uniqueness rule (one grade per student+course) with a
--    new one that allows one grade per student+course PER MONTH
alter table enrollments drop constraint if exists enrollments_student_id_course_id_key;
alter table enrollments add constraint enrollments_student_id_course_id_period_key
  unique (student_id, course_id, period);
