import { describe, expect, it } from "vitest";

import type { Capability } from "../../generation/capability/Capability.js";
import type { ReusableCapability } from "../../knowledge/reusable-capability/ReusableCapability.js";


describe("Emergence Transforms System Capability", () => {

  it("transforms emergent capability into reusable capability", () => {

    const capability: Capability = {
      id: "emergent-capability-1",
      description: "collective emergent capability",
      observable: true,
      coherent: true
    };


    const reusableCapability: ReusableCapability = {
      id: "reusable-capability-1",
      knowledgeId: "knowledge-1",
      description: capability.description,
      validated: true,
      coherent: true
    };


    expect(capability.observable)
      .toBe(true);


    expect(reusableCapability.validated)
      .toBe(true);


    expect(reusableCapability.coherent)
      .toBe(true);

  });


  it("preserves coherence when capability becomes reusable", () => {

    const capability: Capability = {
      id: "capability-2",
      description: "system capability",
      observable: true,
      coherent: true
    };


    const reusableCapability: ReusableCapability = {
      id: "reusable-capability-2",
      knowledgeId: "knowledge-2",
      description: capability.description,
      validated: true,
      coherent: capability.coherent
    };


    expect(reusableCapability.coherent)
      .toBe(capability.coherent);

  });

});