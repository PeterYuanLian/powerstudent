import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  verifySession,
  ADMIN_COOKIE,
  STUDENT_COOKIE,
  AdminSession,
  StudentSession,
} from "@/lib/auth";

export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const session = await verifySession<AdminSession>(token);
  if (!session || session.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "Not signed in to the admin dashboard." }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export async function requireStudent() {
  const store = await cookies();
  const token = store.get(STUDENT_COOKIE)?.value;
  const session = await verifySession<StudentSession>(token);
  if (!session || session.role !== "student") {
    return {
      session: null,
      error: NextResponse.json({ error: "Not signed in as a student." }, { status: 401 }),
    };
  }
  return { session, error: null };
}
