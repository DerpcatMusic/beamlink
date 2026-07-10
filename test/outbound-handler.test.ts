import { describe, expect, it } from "vitest";
import outSource from "../src/pages/out/[slug]/[platform].ts?raw";
import aliasSource from "../src/pages/d/[slug]/[platform].ts?raw";

describe("outbound aliases", () => {
  it("delegate both routes to the same handler", () => {
    expect(outSource).toContain('export { handleOutbound as GET } from "@lib/outbound-handler"');
    expect(aliasSource).toContain('export { handleOutbound as GET } from "@lib/outbound-handler"');
  });
});
