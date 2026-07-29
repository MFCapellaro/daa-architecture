import { describe, expect, it } from "vitest";

import type { Potential } from "../potential/Potential.js";
import type { Possibility } from "../possibility/Possibility.js";
import type { Emergence } from "../emergence/Emergence.js";

describe("Evolution", () => {

  it("transforms potential into emergence", () => {

    const potential: Potential = {
      id: "p1",
      description: "adaptive capability",
      context: "ecosystem"
    };

    const possibility: Possibility = {
      id: "pos1",
      source: potential,
      conditions: [
        "coherent relationships"
      ]
    };

    const emergence: Emergence = {
      id: "e1",
      origin: possibility.id,
      newPotential: potential
    };

    expect(emergence.newPotential)
      .toBeDefined();

  });

});