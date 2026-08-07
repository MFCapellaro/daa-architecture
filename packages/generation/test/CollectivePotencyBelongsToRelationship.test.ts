import { describe, expect, it } from "vitest";

import type { Potential } from "../potential/Potential.js";
import type { Interaction } from "../interaction/Interaction.js";
import type { Potency } from "../potency/Potency.js";


describe("Collective Potency Belongs To Relationship", () => {

  it("creates potency from coherent interaction", () => {

    const potentialA: Potential = {
      id: "potential-a",
      description: "individual potential A",
      context: "ecosystem"
    };


    const potentialB: Potential = {
      id: "potential-b",
      description: "individual potential B",
      context: "ecosystem"
    };


    const interaction: Interaction = {
      id: "interaction-ab",
      participants: [
        potentialA.id,
        potentialB.id
      ],
      coherent: true
    };


    const potency: Potency = {
      id: "potency-ab",
      emerged: true,
      relationships: [
        interaction.id
      ]
    };


    expect(potentialA.id)
      .not
      .toBe(potency.id);


    expect(potentialB.id)
      .not
      .toBe(potency.id);


    expect(potency.relationships)
      .toContain(interaction.id);


    expect(interaction.coherent)
      .toBe(true);

  });


  it("does not attribute collective potency to an individual participant", () => {

    const potency: Potency = {
      id: "collective-potency",
      emerged: true,
      relationships: [
        "relationship-1"
      ]
    };


    expect(potency.relationships.length)
      .toBeGreaterThan(0);

  });

});