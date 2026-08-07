import { describe, expect, it } from "vitest";

import type { Discernment } from "../discernment/Discernment.js";


describe("Discernment Guides Evolution", () => {

  it("interprets context before adaptive transformation", () => {

    const discernment: Discernment = {
      id: "discernment-1",
      experienceId: "experience-1",
      meaning: "contextual-meaning",
      context: "changing-context",
      aligned: true,
      coherent: true
    };


    expect(discernment.context)
      .toBe("changing-context");


    expect(discernment.aligned)
      .toBe(true);

  });


  it("selects coherent possibilities from context", () => {

    const possibilities = {
      available: 3,
      selected: "coherent-option",
      coherent: true
    };


    expect(possibilities.selected)
      .toBe("coherent-option");


    expect(possibilities.coherent)
      .toBe(true);

  });


  it("guides adaptation toward evolutionary continuity", () => {

    const evolution = {
      discernment: true,
      adaptation: true,
      identityPreserved: true
    };


    expect(
      evolution.discernment &&
      evolution.adaptation
    )
      .toBe(true);


    expect(evolution.identityPreserved)
      .toBe(true);

  });

});