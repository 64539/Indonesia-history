import { describe, it, expect } from "vitest";
import { extractSearchKeywords } from "./chat-retrieval";

describe("extractSearchKeywords", () => {
  it("strips stop words and punctuation", () => {
    const k = extractSearchKeywords("reformasi 1998 membahas tentang?");
    expect(k).toContain("reformasi");
    expect(k).toContain("1998");
    expect(k).not.toContain("membahas");
    expect(k).not.toContain("tentang");
  });
});
