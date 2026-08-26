import { NextRequest, NextResponse } from "next/server";
import { signSession, ADMIN_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "Server is missing ADMIN_PASSWORD. Please set it in your environment variables." },
      { status: 500 }
    );
  }

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
  }

  const token = await signSession({ role: "admin" }, "8h");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
