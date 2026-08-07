import { describe, expect, it } from "vitest";
import type { Experience } from "../experience/Experience.js";
import type { Observation } from "../observation/Observation.js";

describe("Observation", () => {

  it("should represent an observed signal emerging from experience", () => {

    const experience: Experience = {
      id: "experience-001",
      context: "UAS ecosystem",
      event: "collective operation completed"
    };

    const observation: Observation = {
      id: "observation-001",
      source: experience,
      signal: "successful interaction pattern"
    };

    expect(observation.id)
      .toBe("observation-001");

    expect(observation.source.id)
      .toBe("experience-001");

    expect(observation.signal)
      .toBe("successful interaction pattern");

  });


  it("should preserve the relationship with the originating experience", () => {

    const experience: Experience = {
      id: "experience-002",
      context: "agricultural network",
      event: "service coordination"
    };

    const observation: Observation = {
      id: "observation-002",
      source: experience,
      signal: "coordination achieved"
    };

    expect(observation.source)
      .toEqual(experience);

  });


  it("should preserve relevant information before interpretation", () => {

    const observation: Observation = {
      id: "observation-003",
      source: {
        id: "experience-003",
        context: "collective context",
        event: "relationship formed"
      },
      signal: "coherent relationship detected"
    };

    expect(observation.signal)
      .toBeDefined();

  });

});