/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { middleware } from "../middleware";

const TEST_SECRET = "test-test-test-test-test-test-test!!";

beforeAll(() => {
  process.env.AUTH_SECRET = TEST_SECRET;
});

async function signTestJwt(claims: { sub: string; role: string }) {
  return new SignJWT({ role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(TEST_SECRET));
}

vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn(),
      next: vi.fn(),
      json: vi.fn(),
    },
  };
});

describe("Middleware", () => {
  let request: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect unauthenticated users accessing dashboard", async () => {
    request = {
      nextUrl: { pathname: "/dashboard" },
      url: "http://localhost:3000/dashboard",
      cookies: { get: vi.fn().mockReturnValue(undefined) },
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: "http://localhost:3000/login",
      })
    );
  });

  it("should allow authenticated admin accessing dashboard", async () => {
    const adminToken = await signTestJwt({ sub: "admin", role: "admin" });
    request = {
      nextUrl: { pathname: "/dashboard" },
      url: "http://localhost:3000/dashboard",
      cookies: {
        get: vi.fn((name) => {
          if (name === "auth-token") return { value: adminToken };
          return undefined;
        }),
      },
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("should redirect authenticated users away from login page", async () => {
    const adminToken = await signTestJwt({ sub: "1", role: "admin" });
    request = {
      nextUrl: { pathname: "/login" },
      url: "http://localhost:3000/login",
      cookies: {
        get: vi.fn((name) => {
          if (name === "auth-token") return { value: adminToken };
          return undefined;
        }),
      },
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: "http://localhost:3000/dashboard",
      })
    );
  });

  it("should block unauthorized access to AI chat API", async () => {
    request = {
      nextUrl: { pathname: "/api/chat" },
      url: "http://localhost:3000/api/chat",
      cookies: { get: vi.fn().mockReturnValue(undefined) },
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" }, { status: 401 });
  });

  it("should block forged JSON auth-token for AI chat API", async () => {
    const forged = JSON.stringify({ id: "u1", role: "student" });
    request = {
      nextUrl: { pathname: "/api/chat" },
      url: "http://localhost:3000/api/chat",
      cookies: {
        get: vi.fn((name) => {
          if (name === "auth-token") return { value: forged };
          return undefined;
        }),
      },
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" }, { status: 401 });
  });

  it("should allow authorized access to AI chat API", async () => {
    const studentToken = await signTestJwt({ sub: "u1", role: "student" });
    request = {
      nextUrl: { pathname: "/api/chat" },
      url: "http://localhost:3000/api/chat",
      cookies: {
        get: vi.fn((name) => {
          if (name === "auth-token") return { value: studentToken };
          return undefined;
        }),
      },
    } as unknown as NextRequest;

    await middleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });
});
