import { describe, expect, it } from "vitest";

import type { Knowledge } from "../../knowledge/Knowledge.js";
import type { Learning } from "../../knowledge/learning/Learning.js";
import type { ReusableCapability } from "../../knowledge/reusable-capability/ReusableCapability.js";

import type { Adaptation } from "../adaptation/Adaptation.js";
import type { Evolution } from "../evolution/Evolution.js";


describe("Knowledge Evolution Cycle", () => {

  it("transforms knowledge into reusable capability", () => {

    const learning: Learning = {
      id: "learning-1",
      observations: [],
      pattern: "coherent adaptation pattern"
    };


    const knowledge: Knowledge = {
      id: "knowledge-1",
      learning: [learning],
      reusableCapability: "reusable-capability-1"
    };


    const reusableCapability: ReusableCapability = {
      id: "reusable-capability-1",
      knowledgeId: knowledge.id,
      description: "Capability preserved through knowledge",
      validated: true,
      coherent: true
    };


    expect(knowledge.learning).toContain(learning);
    expect(reusableCapability.knowledgeId)
      .toBe(knowledge.id);

  });


  it("transforms reusable capability into evolution", () => {

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
      enrichedIdentityId: "identity-enriched-1"
    };


    expect(evolution.adaptationId)
      .toBe(adaptation.id);

    expect(adaptation.coherent).toBe(true);

    expect(adaptation.previousCapabilityId)
      .toBe("capability-previous-1");

    expect(adaptation.enrichedIdentityId)
      .toBe("identity-enriched-1");

    expect(evolution.enrichedIdentityId)
      .toBe("identity-enriched-1");

  });

});