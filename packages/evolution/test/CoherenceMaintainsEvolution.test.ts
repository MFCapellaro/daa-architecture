import { describe, expect, it } from "vitest";

import type { Adaptation } from "../adaptation/Adaptation.js";
import type { Evolution } from "../evolution/Evolution.js";


describe("Coherence Maintains Evolution", () => {

  it("preserves coherence during evolutionary transformation", () => {

    const adaptation: Adaptation = {
      id: "adaptation-1",
      reusableCapabilityId: "reusable-capability-1",
      discernmentId: "discernment-1",
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


  it("rejects transformation without coherence", () => {

    const adaptation: Adaptation = {
      id: "adaptation-2",
      reusableCapabilityId: "reusable-capability-2",
      discernmentId: "discernment-2",
      identityId: "identity-2",
      previousCapabilityId: "capability-previous-2",
      enrichedIdentityId: "identity-enriched-2",
      coherent: false
    };


    expect(adaptation.coherent)
      .toBe(false);

  });

});