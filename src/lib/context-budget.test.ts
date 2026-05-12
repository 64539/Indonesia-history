import { describe, it, expect } from "vitest";
import { truncateAtParagraphBoundary } from "./context-budget";

describe("truncateAtParagraphBoundary", () => {
  it("returns short text unchanged", () => {
    expect(truncateAtParagraphBoundary("hello", 100)).toBe("hello");
  });

  it("cuts at paragraph when possible", () => {
    const text = "a".repeat(30) + "\n\n" + "b".repeat(200);
    const out = truncateAtParagraphBoundary(text, 50);
    expect(out).toBe("a".repeat(30));
    expect(out.includes("b")).toBe(false);
  });
});
