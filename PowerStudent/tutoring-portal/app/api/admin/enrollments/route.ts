import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/guard";

const PERIOD_RE = /^\d{4}-\d{2}$/;

// Create a report card entry, or update an existing one for the same
// student + course + month (upsert on student_id, course_id, period)
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { studentId, courseId, period, grade, gradePercent } = await req.json();
  if (!studentId || !courseId || !period) {
    return NextResponse.json(
      { error: "Student, course, and period are required." },
      { status: 400 }
    );
  }
  if (!PERIOD_RE.test(period)) {
    return NextResponse.json(
      { error: "Period must be in YYYY-MM format." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .upsert(
      {
        student_id: studentId,
        course_id: courseId,
        period,
        grade: grade ?? null,
        grade_percent: gradePercent ?? null,
      },
      { onConflict: "student_id,course_id,period" }
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ enrollment: data });
}

export async function DELETE(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("enrollments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
