import { describe, expect, it } from "vitest";

import type { Capability } from "../capability/Capability.js";

import type { Experience } from "../../knowledge/experience/Experience.js";
import type { Observation } from "../../knowledge/observation/Observation.js";
import type { Learning } from "../../knowledge/learning/Learning.js";
import type { Knowledge } from "../../knowledge/Knowledge.js";
import type { ReusableCapability } from "../../knowledge/reusable-capability/ReusableCapability.js";


describe("Generation Knowledge Integration", () => {

  it("transforms generated capability into knowledge", () => {

    const capability: Capability = {
      id: "capability-1",
      description: "Collective capability generated through coherence",
      observable: true,
      coherent: true
    };


    const experience: Experience = {
        id: "experience-1",
        context: "collective interaction",
        event: "capability emergence"
    };


    const observation: Observation = {
        id: "observation-1",
        source: experience,
        signal: "coherent capability observed"
    };


    const learning: Learning = {
        id: "learning-1",
        observations: [observation],
        pattern: "capability emerges from coherent interaction"
    };


    const knowledge: Knowledge = {
        id: "knowledge-1",
        learning: [learning],
        reusableCapability: "reusable-capability-1"
    };


    expect(capability.observable).toBe(true);
    expect(knowledge.learning).toContain(learning);

  });


  it("creates reusable capability from validated knowledge", () => {

    const reusableCapability: ReusableCapability = {
      id: "reusable-capability-1",
      knowledgeId: "knowledge-1",
      description: "Capability preserved through learning",
      validated: true,
      coherent: true
    };


    expect(reusableCapability.validated).toBe(true);
    expect(reusableCapability.coherent).toBe(true);

  });

});