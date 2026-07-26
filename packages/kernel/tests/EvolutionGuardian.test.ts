import { describe, expect, it } from "vitest";

import { EvolutionGuardian } from "../guardians/EvolutionGuardian.js";
import type { KernelConcept } from "../KernelConcept.js";


describe("EvolutionGuardian", () => {

  it("preserves meaningful evolutionary possibilities", () => {

    const possibility: KernelConcept = {
      id: "evolution",
      name: "Evolution",
      definition:
        "A transformation that increases system capabilities while preserving coherence."
    };


    const guardian = EvolutionGuardian.create();


    expect(
      guardian.preserve(possibility)
    ).toBe(true);

  });


  it("rejects undefined evolutionary possibilities", () => {

    const possibility: KernelConcept = {
      id: "evolution",
      name: "Evolution",
      definition: ""
    };


    const guardian = EvolutionGuardian.create();


    expect(
      guardian.preserve(possibility)
    ).toBe(false);

  });

});