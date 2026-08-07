import { describe, expect, test } from "vitest";

import { Knowledge, Learning, Experience, Observation } from "../../knowledge/index.js";
import { Discernment, Adaptation } from "../index.js";

describe("DAA Spiral Evolution", () => {

  test("should transform generated capability into expanded identity", () => {

    const capability = "coherent emergent capability";

    const experience: Experience = {
      id: "experience-001",
      context: "system evolution",
      event: capability,
    };

    const observation: Observation = {
      id: "observation-001",
      source: experience,
      signal: "capability preserved coherence",
    };

    const learning: Learning = {
      id: "learning-001",
      observations: [observation],
      pattern: "coherence enables reusable capability",
    };

    const knowledge: Knowledge = {
      id: "knowledge-001",
      learning: [learning],
      reusableCapability: "design coherent systems",
    };

    const discernment: Discernment = {
      id: "discernment-001",
      experienceId: experience.id,
      meaning: "preserve identity while increasing capability",
      context: "evolutionary transformation",
      coherent: true,
      aligned: true,
    };

    const adaptation: Adaptation = {
      id: "adaptation-001",
      discernmentId: discernment.id,
      identityId: "identity-001",
      previousCapabilityId: capability,
      reusableCapabilityId: knowledge.reusableCapability,
      enrichedIdentityId: "identity-enriched-001",
      coherent: true,
    };

    expect(knowledge.learning[0])
      .toBe(learning);

    expect(discernment.experienceId)
      .toBe(experience.id);

    expect(adaptation.discernmentId)
      .toBe(discernment.id);

    expect(adaptation.enrichedIdentityId)
      .toBe("identity-enriched-001");

    expect(adaptation.coherent)
      .toBe(true);

    expect(adaptation.reusableCapabilityId)
      .not
      .toBe(adaptation.previousCapabilityId);

  });

});