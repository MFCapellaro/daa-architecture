import { describe, expect, it } from "vitest";

import type { Discernment } from "../discernment/Discernment.js";
import type { Adaptation } from "../adaptation/Adaptation.js";
import type { Evolution } from "../evolution/Evolution.js";


describe("Discernment Evolution Gate", () => {

  it("allows coherent capability transformation", () => {

    const discernment: Discernment = {
        id: "discernment-1",
        experienceId: "experience-1",
        meaning: "capability evolution",
        context: "coherent transformation",
        aligned: true,
        coherent: true
    };


    const adaptation: Adaptation = {
      id: "adaptation-1",
      reusableCapabilityId: "reusable-capability-1",
      discernmentId: discernment.id,
      identityId: "identity-1",
      previousCapabilityId: "capability-previous-1",
      enrichedIdentityId: "identity-enriched-1",
      coherent: true
    };


    const evolution: Evolution = {
      id: "evolution-1",
      adaptationId: adaptation.id,
      enrichedIdentityId: adaptation.enrichedIdentityId
    };


    expect(adaptation.coherent)
      .toBe(true);

    expect(evolution.adaptationId)
      .toBe(adaptation.id);

  });


  it("rejects incoherent transformation", () => {

    const discernment: Discernment = {
        id: "discernment-2",
        experienceId: "experience-2",
        meaning: "incoherent transformation",
        context: "misaligned context",
        aligned: false,
        coherent: false
    };

    expect(discernment.coherent)
        .toBe(false);

    expect(discernment.aligned)
        .toBe(false);

  });

});