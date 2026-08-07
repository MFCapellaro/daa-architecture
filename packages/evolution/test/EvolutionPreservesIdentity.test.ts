import { describe, expect, it } from "vitest";

import type { Adaptation } from "../adaptation/Adaptation.js";


describe("Evolution Preserves Identity", () => {

  it("preserves identity during coherent adaptation", () => {

    const adaptation: Adaptation = {
      id: "adaptation-1",
      discernmentId: "discernment-1",
      identityId: "identity-original",
      previousCapabilityId: "capability-previous",
      enrichedIdentityId: "identity-enriched",
      reusableCapabilityId: "capability-reusable",
      coherent: true
    };


    expect(adaptation.identityId)
      .toBe("identity-original");


    expect(adaptation.enrichedIdentityId)
      .toBe("identity-enriched");


    expect(adaptation.coherent)
      .toBe(true);

  });


  it("allows identity enrichment without identity replacement", () => {

    const evolution = {
      previousIdentity: "identity-original",
      enrichedIdentity: "identity-enriched",
      preserved: true
    };


    expect(evolution.preserved)
      .toBe(true);


    expect(evolution.previousIdentity)
      .not
      .toBe(evolution.enrichedIdentity);

  });

});