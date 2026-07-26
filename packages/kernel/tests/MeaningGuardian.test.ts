import { describe, expect, it } from "vitest";

import { MeaningGuardian } from "../guardians/MeaningGuardian.js";
import type { KernelConcept } from "../KernelConcept.js";


describe("MeaningGuardian", () => {

  it("preserves concepts with semantic definition", () => {

    const concept: KernelConcept = {
      id: "meaning",
      name: "Meaning",
      definition:
        "The semantic foundation that gives significance to concepts."
    };


    const guardian = MeaningGuardian.create();


    expect(
      guardian.preserve(concept)
    ).toBe(true);

  });


  it("rejects concepts without semantic definition", () => {

    const concept: KernelConcept = {
      id: "meaning",
      name: "Meaning",
      definition: ""
    };


    const guardian = MeaningGuardian.create();


    expect(
      guardian.preserve(concept)
    ).toBe(false);

  });

});