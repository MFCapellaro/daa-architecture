import { describe, expect, test } from "vitest";

import {
  Experience,
  Observation,
  Learning,
  Knowledge
} from "../index.js";

describe("Knowledge formation", () => {

  test("emerges from integrated learning", () => {

    const experience: Experience = {
      id: "experience",
      context: "architecture",
      event: "coherence implemented"
    };

    const observation: Observation = {
      id: "observation",
      source: experience,
      signal: "identity was preserved"
    };

    const learning: Learning = {
      id: "learning",
      observations: [observation],
      pattern: "coherence emerges through preserved identity"
    };

    const knowledge: Knowledge = {
      id: "knowledge",
      learning: [learning],
      capability: "design coherent systems"
    };

    expect(knowledge.learning[0])
      .toBe(learning);

    expect(learning.observations[0])
      .toBe(observation);

    expect(observation.source)
      .toBe(experience);

    expect(knowledge.capability)
      .toBe("design coherent systems");

  });

});