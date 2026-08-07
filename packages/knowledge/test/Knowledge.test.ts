import { describe, expect, it } from "vitest";
import type { Learning } from "../learning/Learning.js";
import type { Knowledge } from "../Knowledge.js";

describe("Knowledge", () => {

  it("should integrate learning into reusable capability", () => {

    const learning: Learning = {
      id: "learning-001",
      observations: [],
      pattern: "coherent operational pattern"
    };

    const knowledge: Knowledge = {
      id: "knowledge-001",
      learning: [learning],
      reusableCapability: "adaptive operational capability"
    };

    expect(knowledge.id)
      .toBe("knowledge-001");

    expect(knowledge.learning)
      .toHaveLength(1);

    expect(knowledge.reusableCapability)
      .toBe("adaptive operational capability");

  });


  it("should preserve the learning from which knowledge emerges", () => {

    const learning: Learning = {
      id: "learning-002",
      observations: [],
      pattern: "collective coordination"
    };

    const knowledge: Knowledge = {
      id: "knowledge-002",
      learning: [learning],
      reusableCapability: "collective coordination capability"
    };

    expect(knowledge.learning[0])
      .toEqual(learning);

  });


  it("should represent knowledge as a foundation for future evolution", () => {

    const knowledge: Knowledge = {
      id: "knowledge-003",
      learning: [],
      reusableCapability: "continuous improvement capability"
    };

    expect(knowledge.reusableCapability)
      .toBeDefined();

  });

});