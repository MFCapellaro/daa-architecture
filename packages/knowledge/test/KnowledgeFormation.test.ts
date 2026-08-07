import { describe, expect, test } from "vitest";

import {
  Experience,
  Observation,
  Learning,
  Knowledge,
  ReusableCapability
} from "../index.js";

describe("Knowledge formation", () => {

  test("integrates learning into reusable capability", () => {

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
      reusableCapability: "coherent architectural composition"
    };

    const reusableCapability: ReusableCapability = {
      id: "reusable-capability",
      knowledgeId: knowledge.id,
      description: knowledge.reusableCapability,
      validated: true,
      coherent: true
    };

    expect(observation.source)
      .toBe(experience);

    expect(learning.observations[0])
      .toBe(observation);

    expect(knowledge.learning[0])
      .toBe(learning);

    expect(reusableCapability.knowledgeId)
      .toBe(knowledge.id);

    expect(reusableCapability.description)
      .toBe(knowledge.reusableCapability);

    expect(reusableCapability.validated)
      .toBe(true);

    expect(reusableCapability.coherent)
      .toBe(true);

  });

});