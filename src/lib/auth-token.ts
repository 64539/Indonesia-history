import { SignJWT, jwtVerify } from "jose";

export type AuthTokenPayload = {
  id: string;
  role: string;
  email?: string;
  name?: string | null;
};

const DEV_FALLBACK_SECRET = "development-only-secret-min-32chars!";

function getSecretKey(): Uint8Array {
  const s = process.env.AUTH_SECRET?.trim();
  if (s && s.length >= 32) {
    return new TextEncoder().encode(s);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to at least 32 characters in production");
  }
  return new TextEncoder().encode(DEV_FALLBACK_SECRET);
}

/** Issue a signed JWT for the HttpOnly `auth-token` cookie (Edge-safe). */
export async function signAuthToken(user: {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
}): Promise<string> {
  const secret = getSecretKey();
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role ?? "student",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/** Verify JWT from `auth-token` cookie. Returns null if invalid or expired. */
export async function verifyAuthToken(
  tokenStr: string | undefined
): Promise<AuthTokenPayload | null> {
  if (!tokenStr?.trim()) return null;
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(tokenStr, secret, { algorithms: ["HS256"] });
    const id = typeof payload.sub === "string" ? payload.sub : null;
    if (!id) return null;
    const role = typeof payload.role === "string" ? payload.role : undefined;
    if (!role) return null;
    return {
      id,
      role,
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: payload.name === null || typeof payload.name === "string" ? payload.name : undefined,
    };
  } catch {
    return null;
  }
}
