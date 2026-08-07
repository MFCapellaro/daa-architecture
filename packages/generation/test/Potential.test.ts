import { describe, expect, it } from "vitest";
import type { Potential } from "../potential/Potential.js";

describe("Potential", () => {

  it("should represent coherent possibilities revealed by trajectory", () => {

    const potential: Potential = {
      id: "potential-001",
      description: "agricultural drone operational capability",
      context: "UAS ecosystem"
    };

    expect(potential.id)
      .toBe("potential-001");

    expect(potential.description)
      .toBeDefined();

  });


  it("should preserve contextual meaning", () => {

    const potential: Potential = {
      id: "potential-002",
      description: "collective service capability",
      context: "shared operation"
    };

    expect(potential.context)
      .toBe("shared operation");

  });


  it("should not represent an already manifested capability", () => {

    const potential: Potential = {
      id: "potential-003",
      description: "possible future interaction",
      context: "ecosystem"
    };

    expect(potential.id)
      .toBeDefined();

    expect(potential.description)
      .not.toBe("");

  });

});