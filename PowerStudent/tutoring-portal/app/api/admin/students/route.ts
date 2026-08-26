import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/guard";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { studentId, name, password } = await req.json();
  if (!studentId || !name || !password) {
    return NextResponse.json({ error: "学号、姓名、密码均为必填。" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const password_hash = await hashPassword(password);

  const { data, error } = await supabase
    .from("students")
    .insert({ student_id: studentId.trim(), name: name.trim(), password_hash })
    .select("id, student_id, name")
    .single();

  if (error) {
    const message = error.code === "23505" ? "该学号已存在。" : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ student: data });
}

export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id, name, password } = await req.json();
  if (!id) return NextResponse.json({ error: "缺少学生 id。" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const update: Record<string, string> = {};
  if (name) update.name = name.trim();
  if (password) update.password_hash = await hashPassword(password);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "没有要更新的内容。" }, { status: 400 });
  }

  const { error } = await supabase.from("students").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少学生 id。" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
