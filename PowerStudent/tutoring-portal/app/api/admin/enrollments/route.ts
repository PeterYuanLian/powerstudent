import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/guard";

// Create an enrollment, or update the grade of an existing one (upsert on student_id + course_id)
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { studentId, courseId, grade, gradePercent } = await req.json();
  if (!studentId || !courseId) {
    return NextResponse.json({ error: "Student and course are required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .upsert(
      {
        student_id: studentId,
        course_id: courseId,
        grade: grade ?? null,
        grade_percent: gradePercent ?? null,
      },
      { onConflict: "student_id,course_id" }
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
