-- 在 Supabase 项目的 SQL Editor 中粘贴并运行这整个文件一次即可完成建表。

create extension if not exists pgcrypto;

-- 学生表：student_id 是学生登录用的"学号"，可以自己定义，例如 s001
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_id text unique not null,
  name text not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- 课程表
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  teacher text,
  schedule text,
  created_at timestamptz default now()
);

-- 选课/成绩表：一个学生在一门课上的整体成绩
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  grade text,          -- 例如 "A" / "92"，自由文本，方便手动填写
  grade_percent numeric, -- 可选：百分比数值，用于统计/排序
  created_at timestamptz default now(),
  unique(student_id, course_id)
);

-- 作业表：属于某门课程
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  due_date date,
  max_score numeric,
  created_at timestamptz default now()
);

-- 每个学生每份作业的完成情况/得分
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

-- 说明：本项目的读写全部通过服务端 API（使用 Service Role Key）完成，
-- 不在浏览器端直接访问 Supabase，所以这里不需要开启/配置 Row Level Security 策略。
-- 如果你以后想让浏览器直接连 Supabase，请务必开启 RLS 并编写对应策略。
