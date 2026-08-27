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
    .select(
      "id, period, grade, grade_percent, courses(id, name, subject, teacher, schedule)"
    )
    .eq("student_id", studentDbId)
    .order("period", { ascending: false });

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  type CourseRow = {
    id: string;
    name: string;
    subject: string | null;
    teacher: string | null;
    schedule: string | null;
  };

  // Distinct courses the student has ever had a report card entry for —
  // shown as the general "My Courses" roster (not tied to one month).
  const courseMap = new Map<string, CourseRow>();
  for (const e of enrollments ?? []) {
    const c = e.courses as unknown as CourseRow | null;
    if (c && !courseMap.has(c.id)) courseMap.set(c.id, c);
  }
  const courses = Array.from(courseMap.values());
  const courseIds = courses.map((c) => c.id);

  // Group grades by month into report cards, most recent first.
  const periodMap = new Map<
    string,
    Array<{
      courseId: string;
      name: string;
      subject: string | null;
      teacher: string | null;
      grade: string | null;
      gradePercent: number | null;
    }>
  >();
  for (const e of enrollments ?? []) {
    const c = e.courses as unknown as CourseRow | null;
    if (!c) continue;
    const list = periodMap.get(e.period) ?? [];
    list.push({
      courseId: c.id,
      name: c.name,
      subject: c.subject,
      teacher: c.teacher,
      grade: e.grade,
      gradePercent: e.grade_percent,
    });
    periodMap.set(e.period, list);
  }
  const reportCards = Array.from(periodMap.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([period, courseGrades]) => ({ period, courseGrades }));

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

  return NextResponse.json({
    name: session!.name,
    studentId: session!.studentId,
    courses,
    reportCards,
    assignments,
  });
}
