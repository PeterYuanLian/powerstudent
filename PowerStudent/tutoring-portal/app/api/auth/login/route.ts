import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPassword } from "@/lib/password";
import { signSession, STUDENT_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { studentId, password } = await req.json();

  if (!studentId || !password) {
    return NextResponse.json(
      { error: "Please enter your student ID and password." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: student, error } = await supabase
    .from("students")
    .select("id, student_id, name, password_hash")
    .eq("student_id", studentId.trim())
    .maybeSingle();

  if (error || !student) {
    return NextResponse.json(
      { error: "Incorrect student ID or password." },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(password, student.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Incorrect student ID or password." },
      { status: 401 }
    );
  }

  const token = await signSession({
    role: "student",
    studentId: student.student_id,
    studentDbId: student.id,
    name: student.name,
  });

  const res = NextResponse.json({ ok: true, name: student.name });
  res.cookies.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
