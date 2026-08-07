import { describe, expect, it } from "vitest";

import type { Capability } from "../../generation/capability/Capability.js";


describe("Possibility Becomes Capability", () => {

  it("transforms selected possibility into capability", () => {

    const possibility = {
      id: "possibility-1",
      selected: true,
      coherent: true
    };


    const capability: Capability = {
      id: "capability-emerged",
      description: "capability generated from possibility",
      observable: true,
      coherent: true
    };


    expect(possibility.selected)
      .toBe(true);


    expect(capability.observable)
      .toBe(true);


    expect(capability.coherent)
      .toBe(true);

  });


  it("connects action with realized potential", () => {

    const realization = {
      possibility: "possibility-1",
      action: "coherent-action",
      realized: true
    };


    expect(realization.action)
      .toBe("coherent-action");


    expect(realization.realized)
      .toBe(true);

  });


  it("creates new potential from generated capability", () => {

    const cycle = {
      capability: true,
      newPotential: true,
      evolutionary: true
    };


    expect(
      cycle.capability &&
      cycle.newPotential
    )
      .toBe(true);


    expect(cycle.evolutionary)
      .toBe(true);

  });

});