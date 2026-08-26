import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/guard";

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { name, subject, teacher, schedule } = await req.json();
  if (!name) return NextResponse.json({ error: "Course name is required." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("courses")
    .insert({ name: name.trim(), subject, teacher, schedule })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ course: data });
}

export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id, name, subject, teacher, schedule } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing course id." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const update: Record<string, string> = {};
  if (name !== undefined) update.name = name;
  if (subject !== undefined) update.subject = subject;
  if (teacher !== undefined) update.teacher = teacher;
  if (schedule !== undefined) update.schedule = schedule;

  const { error } = await supabase.from("courses").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing course id." }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
