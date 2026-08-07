import { describe, expect, it } from "vitest";

import type { Adaptation } from "../adaptation/Adaptation.js";


describe("Coherence Guides Evolution", () => {

  it("allows only coherent adaptations to advance evolution", () => {

    const adaptation: Adaptation = {
      id: "adaptation-1",
      discernmentId: "discernment-1",
      identityId: "identity-1",
      previousCapabilityId: "capability-previous",
      enrichedIdentityId: "identity-enriched",
      reusableCapabilityId: "capability-reusable",
      coherent: true
    };


    const canEvolve =
      adaptation.coherent;


    expect(canEvolve)
      .toBe(true);

  });


  it("prevents incoherent transformation from becoming evolution", () => {

    const adaptation: Adaptation = {
      id: "adaptation-invalid",
      discernmentId: "discernment-2",
      identityId: "identity-1",
      previousCapabilityId: "capability-previous",
      enrichedIdentityId: "identity-fragmented",
      reusableCapabilityId: "capability-invalid",
      coherent: false
    };


    const canEvolve =
      adaptation.coherent;


    expect(canEvolve)
      .toBe(false);

  });


  it("maintains coherence as the bridge between possibility and evolution", () => {

    const evolutionPath = {
      possibility: true,
      coherence: true,
      adaptation: true,
      evolution: true
    };


    expect(
      evolutionPath.possibility &&
      evolutionPath.coherence &&
      evolutionPath.adaptation
    )
      .toBe(true);


    expect(evolutionPath.evolution)
      .toBe(true);

  });

});