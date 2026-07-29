import { describe, expect, it } from "vitest";
import type { Flows } from "../src/Flows.js";

describe("Flows", () => {
  it("defines the capability that expresses coordinated behavior", () => {
    const flow: Flows = {
      coordinated: true
    };

    expect(flow.coordinated).toBe(true);
  });
});