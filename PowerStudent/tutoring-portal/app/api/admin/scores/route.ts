import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/guard";

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { assignmentId, studentId, score, status, feedback } = await req.json();
  if (!assignmentId || !studentId) {
    return NextResponse.json({ error: "作业和学生均为必填。" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assignment_scores")
    .upsert(
      {
        assignment_id: assignmentId,
        student_id: studentId,
        score: score ?? null,
        status: status || "assigned",
        feedback: feedback ?? null,
      },
      { onConflict: "assignment_id,student_id" }
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ scoreRow: data });
}

export async function DELETE(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id。" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("assignment_scores").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
