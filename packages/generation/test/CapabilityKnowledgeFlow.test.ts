import { describe, expect, it } from "vitest";

import type { Capability } from "../capability/Capability.js";

import type { Experience } from "../../knowledge/experience/Experience.js";
import type { Observation } from "../../knowledge/observation/Observation.js";
import type { Learning } from "../../knowledge/learning/Learning.js";
import type { Knowledge } from "../../knowledge/Knowledge.js";
import type { ReusableCapability } from "../../knowledge/reusable-capability/ReusableCapability.js";

describe("Capability → Knowledge Flow", () => {

  it("transforms capability into reusable capability through learning", () => {

    const capability: Capability = {
      id: "capability-1",
      observable: true,
      description: "Coherent collective capability",
      potencyId: "potency-1",
      coherent: true
    };

    const experience: Experience = {
      id: "experience-1",
      context: "UAS Pool",
      event: capability.description
    };

    const observation: Observation = {
      id: "observation-1",
      source: experience,
      signal: "Capability successfully observed"
    };

    const learning: Learning = {
      id: "learning-1",
      observations: [observation],
      pattern: "Collective capability emerges from coherent interaction"
    };

    const reusableCapability: ReusableCapability = {
        id: "rc-1",
        knowledgeId: "knowledge-1",
        description: capability.description,
        validated: true,
        coherent: true
    };

    const knowledge: Knowledge = {
        id: "knowledge-1",
        learning: [learning],
        reusableCapability: reusableCapability.id
    };

    expect(capability.observable).toBe(true);
    expect(observation.source.id).toBe(experience.id);
    expect(learning.observations).toHaveLength(1);
    expect(knowledge.learning[0].pattern)
      .toContain("Collective capability");
    expect(knowledge.reusableCapability)
        .toBe(reusableCapability.id);
    expect(reusableCapability.description)
        .toBe(capability.description);
    expect(reusableCapability.validated)
        .toBe(true);
    expect(reusableCapability.coherent)
        .toBe(true);

  });

});