import { describe, expect, it } from "vitest";

import type { Evolution } from "../evolution/Evolution.js";

import type { Experience } from "../../knowledge/experience/Experience.js";
import type { Observation } from "../../knowledge/observation/Observation.js";
import type { Learning } from "../../knowledge/learning/Learning.js";
import type { Knowledge } from "../../knowledge/Knowledge.js";


describe("Evolution Generates Knowledge", () => {

  it("creates new knowledge from evolved experience", () => {

    const evolution: Evolution = {
      id: "evolution-1",
      adaptationId: "adaptation-1",
      enrichedIdentityId: "identity-enriched-1"
    };


    const experience: Experience = {
      id: "experience-new-1",
      context: "evolved capability",
      event: "new operational condition"
    };


    const observation: Observation = {
      id: "observation-new-1",
      source: experience,
      signal: "new coherent pattern"
    };


    const learning: Learning = {
      id: "learning-new-1",
      observations: [observation],
      pattern: "evolutionary adaptation pattern"
    };


    const knowledge: Knowledge = {
      id: "knowledge-new-1",
      learning: [learning],
      reusableCapability: "reusable-capability-new-1"
    };


    expect(evolution.enrichedIdentityId)
      .toBe("identity-enriched-1");


    expect(knowledge.learning)
      .toContain(learning);


    expect(learning.observations)
      .toContain(observation);

  });

});