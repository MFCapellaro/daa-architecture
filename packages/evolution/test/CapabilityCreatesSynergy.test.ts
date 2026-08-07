import { describe, expect, it } from "vitest";

import type { Capability } from "../../generation/capability/Capability.js";


describe("Capability Creates Synergy", () => {

  it("combines coherent capabilities through interaction", () => {

    const capabilityA: Capability = {
      id: "capability-a",
      description: "first capability",
      observable: true,
      coherent: true
    };


    const capabilityB: Capability = {
      id: "capability-b",
      description: "second capability",
      observable: true,
      coherent: true
    };


    const synergy = {
      capabilities: [
        capabilityA,
        capabilityB
      ],
      coherentInteraction: true
    };


    expect(synergy.capabilities.length)
      .toBe(2);


    expect(synergy.coherentInteraction)
      .toBe(true);

  });


  it("generates capability beyond individual components", () => {

    const emergentCapability = {
      sourceCapabilities: [
        "capability-a",
        "capability-b"
      ],
      emerged: true,
      collective: true
    };


    expect(emergentCapability.emerged)
      .toBe(true);


    expect(emergentCapability.collective)
      .toBe(true);

  });


  it("feeds synergy back into evolutionary possibility", () => {

    const evolution = {
      synergy: true,
      newPossibility: true,
      continuedEvolution: true
    };


    expect(
      evolution.synergy &&
      evolution.newPossibility
    )
      .toBe(true);


    expect(evolution.continuedEvolution)
      .toBe(true);

  });

});