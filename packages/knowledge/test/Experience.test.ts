import { describe, expect, it } from "vitest";
import type { Experience } from "../experience/Experience.js";

describe("Experience", () => {

  it("should represent an event occurring within a context", () => {

    const experience: Experience = {
      id: "experience-001",
      context: "UAS ecosystem",
      event: "collective operation completed"
    };

    expect(experience.id)
      .toBe("experience-001");

    expect(experience.context)
      .toBe("UAS ecosystem");

    expect(experience.event)
      .toBe("collective operation completed");

  });


  it("should preserve the context where experience emerges", () => {

    const experience: Experience = {
      id: "experience-002",
      context: "agricultural network",
      event: "successful collaboration"
    };

    expect(experience.context)
      .toBeDefined();

  });


  it("should provide the foundation for observation and learning", () => {

    const experience: Experience = {
      id: "experience-003",
      context: "collective system",
      event: "interaction pattern revealed"
    };

    expect(experience.event)
      .toBeDefined();

  });

});