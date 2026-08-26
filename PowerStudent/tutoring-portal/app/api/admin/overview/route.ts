import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = getSupabaseAdmin();

  const [studentsRes, coursesRes, enrollmentsRes, assignmentsRes, scoresRes] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, student_id, name, created_at")
        .order("student_id"),
      supabase.from("courses").select("*").order("name"),
      supabase
        .from("enrollments")
        .select("id, student_id, course_id, grade, grade_percent"),
      supabase
        .from("assignments")
        .select("*")
        .order("due_date", { ascending: true }),
      supabase
        .from("assignment_scores")
        .select("id, assignment_id, student_id, score, status, feedback"),
    ]);

  const firstError =
    studentsRes.error ||
    coursesRes.error ||
    enrollmentsRes.error ||
    assignmentsRes.error ||
    scoresRes.error;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  return NextResponse.json({
    students: studentsRes.data,
    courses: coursesRes.data,
    enrollments: enrollmentsRes.data,
    assignments: assignmentsRes.data,
    scores: scoresRes.data,
  });
}
