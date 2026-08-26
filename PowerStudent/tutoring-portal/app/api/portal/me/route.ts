import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireStudent } from "@/lib/guard";

export async function GET() {
  const { session, error } = await requireStudent();
  if (error) return error;

  const supabase = getSupabaseAdmin();
  const studentDbId = session!.studentDbId;

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("id, grade, grade_percent, courses(id, name, subject, teacher, schedule)")
    .eq("student_id", studentDbId);

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  const courseIds = (enrollments ?? [])
    .map((e) => (e.courses as unknown as { id: string } | null)?.id)
    .filter(Boolean) as string[];

  let assignments: Array<Record<string, unknown>> = [];
  if (courseIds.length > 0) {
    const { data: assignmentRows, error: assignError } = await supabase
      .from("assignments")
      .select("id, title, due_date, max_score, course_id, courses(name)")
      .in("course_id", courseIds)
      .order("due_date", { ascending: true });

    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }

    const assignmentIds = (assignmentRows ?? []).map((a) => a.id);
    const { data: scoreRows, error: scoreError } = await supabase
      .from("assignment_scores")
      .select("assignment_id, score, status, feedback")
      .eq("student_id", studentDbId)
      .in("assignment_id", assignmentIds.length > 0 ? assignmentIds : [""]);

    if (scoreError) {
      return NextResponse.json({ error: scoreError.message }, { status: 500 });
    }

    const scoreByAssignment = new Map(
      (scoreRows ?? []).map((s) => [s.assignment_id, s])
    );

    assignments = (assignmentRows ?? []).map((a) => {
      const scoreRow = scoreByAssignment.get(a.id);
      return {
        id: a.id,
        title: a.title,
        dueDate: a.due_date,
        maxScore: a.max_score,
        courseName: (a.courses as unknown as { name: string } | null)?.name ?? "",
        score: scoreRow?.score ?? null,
        status: scoreRow?.status ?? "assigned",
        feedback: scoreRow?.feedback ?? null,
      };
    });
  }

  const courses = (enrollments ?? []).map((e) => {
    const c = e.courses as unknown as {
      id: string;
      name: string;
      subject: string | null;
      teacher: string | null;
      schedule: string | null;
    } | null;
    return {
      id: c?.id,
      name: c?.name,
      subject: c?.subject,
      teacher: c?.teacher,
      schedule: c?.schedule,
      grade: e.grade,
      gradePercent: e.grade_percent,
    };
  });

  return NextResponse.json({
    name: session!.name,
    studentId: session!.studentId,
    courses,
    assignments,
  });
}
