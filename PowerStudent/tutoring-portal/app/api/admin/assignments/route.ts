import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/guard";

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { courseId, title, dueDate, maxScore } = await req.json();
  if (!courseId || !title) {
    return NextResponse.json({ error: "课程和作业标题为必填。" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      course_id: courseId,
      title: title.trim(),
      due_date: dueDate || null,
      max_score: maxScore ?? null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ assignment: data });
}

export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id, title, dueDate, maxScore } = await req.json();
  if (!id) return NextResponse.json({ error: "缺少作业 id。" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = {};
  if (title !== undefined) update.title = title;
  if (dueDate !== undefined) update.due_date = dueDate;
  if (maxScore !== undefined) update.max_score = maxScore;

  const { error } = await supabase.from("assignments").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少作业 id。" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
