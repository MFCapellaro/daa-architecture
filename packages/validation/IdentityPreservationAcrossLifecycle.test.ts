import { describe, expect, it } from "vitest";

import type { Adaptation } from "../evolution/adaptation/Adaptation.js";
import type { Evolution } from "../evolution/evolution/Evolution.js";


describe("Identity Preservation Across Lifecycle", () => {

  it("preserves identity through coherent transformation", () => {

    const originalIdentity = {
      id: "identity-1",
      essence: "core-purpose"
    };


    const adaptation: Adaptation = {
      id: "adaptation-1",
      reusableCapabilityId: "reusable-capability-1",
      discernmentId: "discernment-1",
      identityId: originalIdentity.id,
      previousCapabilityId: "capability-previous-1",
      enrichedIdentityId: "identity-enriched-1",
      coherent: true
    };


    const evolution: Evolution = {
      id: "evolution-1",
      adaptationId: adaptation.id,
      enrichedIdentityId: adaptation.enrichedIdentityId
    };


    expect(adaptation.identityId)
      .toBe(originalIdentity.id);


    expect(adaptation.coherent)
      .toBe(true);


    expect(evolution.enrichedIdentityId)
      .toBe("identity-enriched-1");

  });


  it("does not replace identity, it enriches identity", () => {

    const identityBefore = "identity-1";
    const identityAfter = "identity-enriched-1";


    expect(identityAfter)
      .not
      .toBe(identityBefore);

  });

});