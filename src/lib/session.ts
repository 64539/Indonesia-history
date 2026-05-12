import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { verifyAuthToken } from "@/lib/auth-token";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export function isStaffRole(role: string): boolean {
  return role === "admin" || role === "guru" || role === "teacher";
}

/** CMS / materi editors: admin and guru only (not teacher). */
export function isMateriEditorRole(role: string): boolean {
  return role === "admin" || role === "guru";
}

/**
 * Resolve the current user from the HttpOnly JWT (`auth-token`) and the database.
 * Role and identity always come from the DB row keyed by JWT `sub`, not from client-controlled cookies.
 */
export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const tokenStr = cookieStore.get("auth-token")?.value;
  const jwtPayload = await verifyAuthToken(tokenStr);
  if (!jwtPayload?.id) return null;
  try {
    const userResult = await db.select().from(users).where(eq(users.id, jwtPayload.id)).limit(1);
    if (!userResult.length) return null;
    const u = userResult[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role ?? "student",
    };
  } catch {
    return null;
  }
}

export async function requireStaffSession(): Promise<SessionUser> {
  const u = await getSessionFromCookies();
  if (!u || !isStaffRole(u.role)) {
    throw new StaffAuthError("Unauthorized", 401);
  }
  return u;
}

/** POST/PUT materi: admin or guru only. */
export async function requireMateriEditorSession(): Promise<SessionUser> {
  const u = await getSessionFromCookies();
  if (!u) {
    throw new StaffAuthError("Unauthorized", 401);
  }
  if (!isMateriEditorRole(u.role)) {
    throw new StaffAuthError("Forbidden", 403);
  }
  return u;
}

export async function requireAdminSession(): Promise<SessionUser> {
  const u = await getSessionFromCookies();
  if (!u) {
    throw new StaffAuthError("Unauthorized", 401);
  }
  if (u.role !== "admin") {
    throw new StaffAuthError("Forbidden", 403);
  }
  return u;
}

export class StaffAuthError extends Error {
  readonly status: number;
  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.name = "StaffAuthError";
    this.status = status;
  }
}
