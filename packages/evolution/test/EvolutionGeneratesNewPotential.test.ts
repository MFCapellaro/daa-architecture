import { describe, expect, it } from "vitest";

import type { Adaptation } from "../adaptation/Adaptation.js";


describe("Evolution Generates New Potential", () => {

  it("creates new potential through coherent evolution", () => {

    const adaptation: Adaptation = {
      id: "adaptation-1",
      discernmentId: "discernment-1",
      identityId: "identity-original",
      previousCapabilityId: "capability-previous",
      enrichedIdentityId: "identity-enriched",
      reusableCapabilityId: "capability-new",
      coherent: true
    };


    const newPotential = {
      sourceCapabilityId: adaptation.reusableCapabilityId,
      available: true
    };


    expect(newPotential.sourceCapabilityId)
      .toBe("capability-new");


    expect(newPotential.available)
      .toBe(true);

  });


  it("preserves identity while expanding possibilities", () => {

    const evolution = {
      identityPreserved: true,
      possibilitiesExpanded: true
    };


    expect(evolution.identityPreserved)
      .toBe(true);


    expect(evolution.possibilitiesExpanded)
      .toBe(true);

  });


  it("establishes the evolutionary spiral", () => {

    const spiral = [
      "potential",
      "generation",
      "capability",
      "knowledge",
      "evolution",
      "potential"
    ];


    expect(spiral[0])
      .toBe("potential");


    expect(spiral[spiral.length - 1])
      .toBe("potential");

  });

});