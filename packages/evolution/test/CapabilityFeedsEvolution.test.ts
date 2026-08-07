import { describe, expect, it } from "vitest";

import type { Capability } from "../../generation/capability/Capability.js";
import type { Knowledge } from "../../knowledge/Knowledge.js";
import type { Discernment } from "../discernment/Discernment.js";
import type { Adaptation } from "../adaptation/Adaptation.js";


describe("Capability Feeds Evolution", () => {

  it("transforms capability into evolutionary knowledge", () => {

    const capability: Capability = {
      id: "capability-1",
      description: "emergent system capability",
      observable: true,
      coherent: true
    };

    
    const knowledge: Knowledge = {
      id: "knowledge-1",
      learning: [],
      reusableCapability: "capability-1"
    };


    expect(knowledge.reusableCapability)
      .toBe(capability.id);

  });


  it("allows knowledge to support evolutionary adaptation", () => {

    const discernment: Discernment = {
      id: "discernment-1",
      experienceId: "experience-1",
      meaning: "meaning-1",
      context: "system",
      aligned: true,
      coherent: true
    };


    const adaptation: Adaptation = {
      id: "adaptation-1",
      discernmentId: discernment.id,
      identityId: "identity-1",
      previousCapabilityId: "capability-1",
      enrichedIdentityId: "identity-2",
      reusableCapabilityId: "capability-1",
      coherent: true
    };


    expect(adaptation.discernmentId)
      .toBe(discernment.id);


    expect(adaptation.coherent)
      .toBe(true);

  });

});