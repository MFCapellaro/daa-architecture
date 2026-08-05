import { describe, expect, it } from "vitest";

import { Adaptation } from "../adaptation/Adaptation.js";

describe("Identity Preservation", () => {
  it("should preserve identity through coherent adaptation", () => {
    const adaptation: Adaptation = {
      id: "adaptation-001",
      discernmentId: "discernment-001",
      identityId: "identity-001",
      previousCapabilityId: "capability-001",
      expandedCapabilityId: "capability-expanded-001",
      preservesIdentity: true,
      coherent: true,
    };

    expect(adaptation.preservesIdentity).toBe(true);

    expect(adaptation.identityId).toBe("identity-001");

    expect(adaptation.previousCapabilityId).not.toBe(
      adaptation.expandedCapabilityId
    );

    expect(adaptation.coherent).toBe(true);
  });

  it("should reject adaptation without identity preservation", () => {
    const adaptation: Adaptation = {
      id: "adaptation-002",
      discernmentId: "discernment-002",
      identityId: "identity-001",
      previousCapabilityId: "capability-001",
      expandedCapabilityId: "capability-expanded-002",
      preservesIdentity: false,
      coherent: false,
    };

    expect(adaptation.preservesIdentity).toBe(false);
    expect(adaptation.coherent).toBe(false);
  });
});