import { describe, expect, it } from "vitest";

import type { ReusableCapability } from "../../knowledge/reusable-capability/ReusableCapability.js";

import type { Discernment } from "../discernment/Discernment.js";
import type { Adaptation } from "../adaptation/Adaptation.js";
import type { Evolution } from "../evolution/Evolution.js";

describe("Reusable Capability Integration", () => {

  it("integrates reusable capability into enriched identity", () => {

    const reusableCapability: ReusableCapability = {
      id: "rc-1",
      knowledgeId: "knowledge-1",
      description: "Validated collective capability",
      validated: true,
      coherent: true
    };

    const discernment: Discernment = {
      id: "discernment-1",
      experienceId: "experience-1",
      meaning: "Capability can be reused",
      context: "UAS Pool",
      coherent: true,
      aligned: true
    };

    const adaptation: Adaptation = {
      id: "adaptation-1",
      discernmentId: discernment.id,
      identityId: "identity-1",
      previousCapabilityId: "capability-1",
      reusableCapabilityId: reusableCapability.id,
      enrichedIdentityId: "identity-2",
      coherent: true
    };

    const evolution: Evolution = {
      id: "evolution-1",
      adaptationId: adaptation.id,
      enrichedIdentityId: adaptation.enrichedIdentityId
    };

    expect(reusableCapability.validated).toBe(true);
    expect(reusableCapability.coherent).toBe(true);

    expect(discernment.coherent).toBe(true);
    expect(discernment.aligned).toBe(true);

    expect(adaptation.discernmentId).toBe(discernment.id);
    expect(adaptation.reusableCapabilityId).toBe(reusableCapability.id);
    expect(adaptation.identityId).not.toBe(adaptation.enrichedIdentityId);
    expect(adaptation.coherent).toBe(true);

    expect(evolution.adaptationId).toBe(adaptation.id);
    expect(evolution.enrichedIdentityId)
      .toBe(adaptation.enrichedIdentityId);

  });

});