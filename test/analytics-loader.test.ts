import { describe, expect, it, vi } from "vitest";
import { sectionResult } from "../src/lib/analytics-loader";

describe("analytics section loading", () => {
  it("keeps a safe unavailable state when one section rejects", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await sectionResult("meta", async () => { throw new Error("token timeout"); });
    expect(result).toEqual({ ok: false, message: "Meta data is temporarily unavailable." });
    expect(error).toHaveBeenCalledWith(expect.stringContaining('"section":"meta"'));
    error.mockRestore();
  });

  it("returns successful section values unchanged", async () => {
    await expect(sectionResult("audience", async () => ({ countries: 2 }))).resolves.toEqual({
      ok: true,
      value: { countries: 2 }
    });
  });
});
