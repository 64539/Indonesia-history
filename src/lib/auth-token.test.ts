/** @vitest-environment node */
import { describe, it, expect, beforeAll } from "vitest";
import { SignJWT } from "jose";
import { signAuthToken, verifyAuthToken } from "./auth-token";

const TEST_SECRET = "test-test-test-test-test-test-test!!";

beforeAll(() => {
  process.env.AUTH_SECRET = TEST_SECRET;
});

describe("verifyAuthToken", () => {
  it("returns null for undefined", async () => {
    expect(await verifyAuthToken(undefined)).toBeNull();
  });

  it("returns null for invalid token", async () => {
    expect(await verifyAuthToken("not-a-jwt")).toBeNull();
  });

  it("verifies a valid signed JWT", async () => {
    const token = await new SignJWT({ role: "admin", email: "a@b.c", name: "A" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(TEST_SECRET));

    const p = await verifyAuthToken(token);
    expect(p?.id).toBe("user-1");
    expect(p?.role).toBe("admin");
    expect(p?.email).toBe("a@b.c");
  });
});

describe("signAuthToken", () => {
  it("round-trips through verifyAuthToken", async () => {
    const token = await signAuthToken({
      id: "u2",
      email: "x@y.z",
      name: "N",
      role: "student",
    });
    const p = await verifyAuthToken(token);
    expect(p?.id).toBe("u2");
    expect(p?.role).toBe("student");
    expect(p?.email).toBe("x@y.z");
  });
});
