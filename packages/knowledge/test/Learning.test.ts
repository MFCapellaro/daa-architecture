import { describe, expect, it } from "vitest";
import type { Observation } from "../observation/Observation.js";
import type { Learning } from "../learning/Learning.js";

describe("Learning", () => {

  it("should transform observations into an identified pattern", () => {

    const observations: Observation[] = [
      {
        id: "observation-001",
        source: {
          id: "experience-001",
          context: "UAS ecosystem",
          event: "collective operation completed"
        },
        signal: "successful coordination"
      }
    ];

    const learning: Learning = {
      id: "learning-001",
      observations,
      pattern: "coherent collaboration pattern"
    };

    expect(learning.id)
      .toBe("learning-001");

    expect(learning.observations)
      .toHaveLength(1);

    expect(learning.pattern)
      .toBe("coherent collaboration pattern");

  });


  it("should preserve the observations from which learning emerged", () => {

    const observation: Observation = {
      id: "observation-002",
      source: {
        id: "experience-002",
        context: "agricultural network",
        event: "service delivery"
      },
      signal: "repeatable process"
    };

    const learning: Learning = {
      id: "learning-002",
      observations: [observation],
      pattern: "operational efficiency"
    };

    expect(learning.observations[0])
      .toEqual(observation);

  });


  it("should represent reusable knowledge through recognized patterns", () => {

    const learning: Learning = {
      id: "learning-003",
      observations: [],
      pattern: "adaptive improvement"
    };

    expect(learning.pattern)
      .toBeDefined();

  });

});