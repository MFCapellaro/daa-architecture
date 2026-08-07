import { describe, expect, it } from "vitest";
import type { Potential } from "../potential/Potential.js";
import type { Possibility } from "../possibility/Possibility.js";

describe("Possibility", () => {

  it("should represent a condition where potential can become manifest", () => {

    const potential: Potential = {
      id: "potential-001",
      description: "collective agricultural operation",
      context: "UAS ecosystem"
    };

    const possibility: Possibility = {
      id: "possibility-001",
      source: potential,
      conditions: [
        "compatible participants",
        "shared purpose"
      ]
    };

    expect(possibility.id)
      .toBe("possibility-001");

    expect(possibility.source.id)
      .toBe("potential-001");

  });


  it("should preserve the relationship with its originating potential", () => {

    const potential: Potential = {
      id: "potential-002",
      description: "distributed service network",
      context: "ecosystem"
    };

    const possibility: Possibility = {
      id: "possibility-002",
      source: potential,
      conditions: [
        "interaction",
        "coherence"
      ]
    };

    expect(possibility.source)
      .toEqual(potential);

  });


  it("should define conditions required for emergence", () => {

    const possibility: Possibility = {
      id: "possibility-003",
      source: {
        id: "potential-003",
        description: "shared capability",
        context: "collective context"
      },
      conditions: [
        "alignment",
        "relationship"
      ]
    };

    expect(possibility.conditions.length)
      .toBeGreaterThan(0);

  });

});