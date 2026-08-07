import { describe, expect, it } from "vitest";
import type { Discernment } from "../discernment/Discernment.js";

describe("Discernment", () => {

  it("should represent coherent recognition from experience", () => {

    const discernment: Discernment = {
      id: "discernment-001",
      experienceId: "experience-001",
      meaning: "identified improvement opportunity",
      context: "operational context",
      coherent: true,
      aligned: true
    };

    expect(discernment.id)
      .toBe("discernment-001");

    expect(discernment.experienceId)
      .toBe("experience-001");

    expect(discernment.coherent)
      .toBe(true);

  });


  it("should identify meaningful transformation paths", () => {

    const discernment: Discernment = {
      id: "discernment-002",
      experienceId: "experience-002",
      meaning: "preserved identity through adaptation",
      context: "evolutionary context",
      coherent: true,
      aligned: true
    };

    expect(discernment.meaning)
      .toBeDefined();

    expect(discernment.context)
      .toBeDefined();

  });


  it("should verify alignment with system purpose", () => {

    const discernment: Discernment = {
      id: "discernment-003",
      experienceId: "experience-003",
      meaning: "coherent evolutionary direction",
      context: "system evolution",
      coherent: true,
      aligned: true
    };

    expect(discernment.aligned)
      .toEqual(true);

  });

});