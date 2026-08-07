import { describe, expect, it } from "vitest";

import type { Adaptation } from "../adaptation/Adaptation.js";


describe("Structure Enables Adaptation", () => {

  it("allows coherent structure to respond to context change", () => {

    const structure = {
      relationships: [
        "relationship-a-b"
      ],
      coherent: true
    };


    const adaptation: Adaptation = {
      id: "adaptation-1",
      discernmentId: "discernment-1",
      identityId: "identity-1",
      previousCapabilityId: "capability-previous",
      enrichedIdentityId: "identity-enriched",
      reusableCapabilityId: "capability-reusable",
      coherent: true
    };


    expect(structure.coherent)
      .toBe(true);


    expect(adaptation.coherent)
      .toBe(true);

  });


  it("preserves identity through adaptive transformation", () => {

    const transformation = {
      previousIdentity: "identity-original",
      enrichedIdentity: "identity-enriched",
      preserved: true
    };


    expect(transformation.preserved)
      .toBe(true);


    expect(transformation.previousIdentity)
      .not
      .toBe(transformation.enrichedIdentity);

  });


  it("converts adaptation into evolutionary capability", () => {

    const evolution = {
      adaptation: true,
      preservedIdentity: true,
      expandedPossibility: true
    };


    expect(
      evolution.adaptation &&
      evolution.preservedIdentity
    )
      .toBe(true);


    expect(evolution.expandedPossibility)
      .toBe(true);

  });

});