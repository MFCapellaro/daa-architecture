import { describe, expect, it } from "vitest";
import type { Adaptation } from "../adaptation/Adaptation.js";

describe("Adaptation", () => {

  it("should represent coherent transformation preserving identity", () => {

    const adaptation: Adaptation = {
      id: "adaptation-001",
      discernmentId: "discernment-001",
      identityId: "identity-001",
      previousCapabilityId: "capability-001",
      reusableCapabilityId: "reusable-capability-001",
      enrichedIdentityId: "identity-enriched-001",
      coherent: true
    };

    expect(adaptation.id)
      .toBe("adaptation-001");

    expect(adaptation.identityId)
      .toBe("identity-001");

    expect(adaptation.coherent)
      .toBe(true);

  });


  it("should integrate reusable capability into enriched identity", () => {

    const adaptation: Adaptation = {
      id: "adaptation-002",
      discernmentId: "discernment-002",
      identityId: "identity-002",
      previousCapabilityId: "capability-002",
      reusableCapabilityId: "reusable-capability-002",
      enrichedIdentityId: "identity-enriched-002",
      coherent: true
    };

    expect(adaptation.reusableCapabilityId)
      .toBeDefined();

    expect(adaptation.enrichedIdentityId)
      .toBeDefined();

  });


  it("should preserve coherence during transformation", () => {

    const adaptation: Adaptation = {
      id: "adaptation-003",
      discernmentId: "discernment-003",
      identityId: "identity-003",
      previousCapabilityId: "capability-003",
      reusableCapabilityId: "reusable-capability-003",
      enrichedIdentityId: "identity-enriched-003",
      coherent: true
    };

    expect(adaptation.coherent)
      .toEqual(true);

  });

});