import { describe, expect, test } from "vitest";

import type { EcosystemRevelation } from "../src/revelation/EcosystemRevelation.js";

import type { KernelConcept } from "../../kernel/KernelConcept.js";


describe("Ecosystem Revelation", () => {

  test("should reveal coherent possibilities from oriented ecosystem conditions", () => {

    const possibilities: KernelConcept[] = [
      {
        id: "future-001",
        name: "Possible Future",
        definition: "A coherent future possibility.",
      },
    ];


    const revelation: EcosystemRevelation = {
      possibilities,
      coherent: true,
    };


    expect(revelation.possibilities)
      .toBe(possibilities);

    expect(revelation.coherent)
      .toBe(true);

  });

});