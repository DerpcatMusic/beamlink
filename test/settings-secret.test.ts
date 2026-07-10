import { describe, expect, it } from "vitest";
import { getMetaAccessToken } from "../src/lib/settings";
import { settingsBodySchema } from "../src/lib/validation";

describe("Meta access-token settings", () => {
  it("reads only the Worker secret and never queries D1", async () => {
    let queried = false;
    const env = {
      META_ACCESS_TOKEN: " worker-secret ",
      DB: { prepare() { queried = true; throw new Error("D1 must not be queried"); } }
    } as any;

    await expect(getMetaAccessToken(env)).resolves.toBe("worker-secret");
    expect(queried).toBe(false);
  });

  it("rejects attempts to write a Meta access token through settings", () => {
    expect(settingsBodySchema.safeParse({ metaAccessToken: "stored-token" }).success).toBe(false);
  });
});
