import { describe, expect, it } from "vitest";

import type { Potency } from "../../generation/potency/Potency.js";
import type { Emergence } from "../../generation/emergence/Emergence.js";


describe("Collective Potential Emergence", () => {

  it("generates collective potency from coherent relationships", () => {

    const potency: Potency = {
      id: "potency-collective",
      emerged: true,
      relationships: [
        "potential-a:potential-b"
      ]
    };


    expect(potency.emerged)
      .toBe(true);


    expect(potency.relationships.length)
      .toBe(1);

  });


  it("reveals emergence from collective potency", () => {

    const emergence: Emergence = {
      id: "emergence-collective",
      potencyId: "potency-collective",
      observable: true
    };


    expect(emergence.potencyId)
      .toBe("potency-collective");


    expect(emergence.observable)
      .toBe(true);

  });


  it("shows that collective capability exceeds isolated potential", () => {

    const collective = {
      individualPotential: 2,
      collectiveCapability: 5
    };


    expect(
      collective.collectiveCapability
    )
      .toBeGreaterThan(
        collective.individualPotential
      );

  });

});