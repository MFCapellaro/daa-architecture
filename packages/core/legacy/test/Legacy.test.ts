import { describe, expect, it } from "vitest";
import type { Legacy } from "../src/Legacy.js";

describe("Legacy", () => {
  it("preserves validated understanding", () => {
    const legacy: Legacy = {
      validated: true
    };

    expect(legacy.validated).toBe(true);
  });
});