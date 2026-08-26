import { SignJWT, jwtVerify } from "jose";

export const STUDENT_COOKIE = "portal_student_session";
export const ADMIN_COOKIE = "portal_admin_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("缺少 AUTH_SECRET 环境变量。");
  }
  return new TextEncoder().encode(secret);
}

export type StudentSession = {
  role: "student";
  studentId: string; // 数据库中的学号
  studentDbId: string; // 数据库主键
  name: string;
};

export type AdminSession = {
  role: "admin";
};

export async function signSession(
  payload: StudentSession | AdminSession,
  expiresIn: string = "12h"
) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifySession<T extends StudentSession | AdminSession>(
  token: string | undefined
): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as T;
  } catch {
    return null;
  }
}
