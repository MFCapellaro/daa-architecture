import { describe, expect, it } from "vitest";
import type { PrimaryTriad } from "../../src/triads/PrimaryTriad.js";

describe("PrimaryTriad", () => {
  it("defines the minimum generative structure", () => {
    const triad: PrimaryTriad = {
      sense: { direction: "North" },
      coherence: { reference: "North" },
      possibility: { potential: "Evolution" },
    };

    expect(triad.sense).toBeDefined();
    expect(triad.coherence).toBeDefined();
    expect(triad.possibility).toBeDefined();
  });
});