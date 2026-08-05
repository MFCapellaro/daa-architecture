import { describe, expect, it } from "vitest";

import { Capability } from "../../generation/capability/Capability.js";
import { Experience } from "../../knowledge/experience/Experience.js";
import { Learning } from "../../knowledge/learning/Learning.js";
import { Knowledge } from "../../knowledge/Knowledge.js";

import { Meaning } from "../../kernel/concepts/Meaning.js";

import { Recognition } from "../Recognition.js";
import { Transmittance } from "../Transmittance.js";
import { Propagation } from "../Propagation.js";


describe("Evolutionary Cycle", () => {

  it("transforms generated capability into propagated coherence", () => {

    const capability: Capability = {
      id: "capability",
      observable: true,
      description: "coherent system design",
      coherent: true
    };


    const experience: Experience = {
      id: "experience",
      context: "generation",
      event: capability.description
    };


    const learning: Learning = {
      id: "learning",
      observations: [],
      pattern: "capability emerges through coherent relationships"
    };


    const knowledge: Knowledge = {
        id: "knowledge",
        learning: [learning],
        reusableCapability: "design coherent systems"
    };


    const recognition = Recognition.of(
      Meaning,
      "knowledge"
    );


    const transmittance = Transmittance.of(
      recognition,
      "knowledge",
      "lux"
    );


    const propagation = Propagation.of(
      transmittance,
      "ecosystem"
    );


    expect(experience.event)
      .toBe(capability.description);

    expect(knowledge.reusableCapability)
        .toBe("design coherent systems");

    expect(propagation.transmittance)
      .toBe(transmittance);

    expect(propagation.context)
      .toBe("ecosystem");

  });

});