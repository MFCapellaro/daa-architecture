import { describe, expect, it } from "vitest";

import { Adaptation } from "../adaptation/Adaptation.js";

describe("Identity Preservation", () => {
  it("should preserve identity through coherent adaptation", () => {
    const adaptation: Adaptation = {
      id: "adaptation-001",
      discernmentId: "discernment-001",
      identityId: "identity-001",
      previousCapabilityId: "capability-001",
      reusableCapabilityId: "capability-expanded-001",
      enrichedIdentityId: "identity-enriched-001",
      coherent: true,
    };

    expect(adaptation.enrichedIdentityId)
      .toBe("identity-enriched-001");

    expect(adaptation.identityId)
      .toBe("identity-001");

    expect(adaptation.previousCapabilityId)
      .not.toBe(adaptation.reusableCapabilityId);

    expect(adaptation.coherent)
      .toBe(true);
  });

  it("should reject adaptation without identity preservation", () => {
    const adaptation: Adaptation = {
      id: "adaptation-002",
      discernmentId: "discernment-002",
      identityId: "identity-001",
      previousCapabilityId: "capability-001",
      reusableCapabilityId: "capability-expanded-002",
      enrichedIdentityId: "identity-enriched-002",
      coherent: false,
    };

    expect(adaptation.coherent)
      .toBe(false);
  });
});