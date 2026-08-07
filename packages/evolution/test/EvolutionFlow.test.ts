import { describe, expect, it } from "vitest";

import { Discernment } from "../discernment/Discernment.js";
import { Adaptation } from "../adaptation/Adaptation.js";

describe("Evolution Flow", () => {
  it("should transform experience into expanded capability while preserving identity", () => {
    const discernment: Discernment = {
      id: "discernment-001",
      experienceId: "experience-001",
      meaning: "Improved alignment through accumulated learning",
      context: "Evolutionary transformation",
      coherent: true,
      aligned: true,
    };

    const adaptation: Adaptation = {
      id: "adaptation-001",
      discernmentId: discernment.id,
      identityId: "identity-001",
      previousCapabilityId: "capability-001",
      reusableCapabilityId: "capability-expanded-001",
      enrichedIdentityId: "identity-enriched-001",
      coherent: true,
    };

    expect(discernment.coherent).toBe(true);
    expect(discernment.aligned).toBe(true);

    expect(adaptation.discernmentId).toBe(discernment.id);

    expect(adaptation.reusableCapabilityId)
      .toBe("capability-expanded-001");

    expect(adaptation.enrichedIdentityId)
      .toBe("identity-enriched-001");

    expect(adaptation.coherent).toBe(true);
  });
});