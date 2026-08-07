import { describe, expect, test } from "vitest";

import type { EcosystemOrientation } from "../src/orientation/EcosystemOrientation.js";

import type { KernelConcept } from "../../kernel/KernelConcept.js";


describe("Ecosystem Orientation", () => {

  test("should establish coherent direction through horizon and purpose", () => {

    const horizon: KernelConcept = {
      id: "horizon",
      name: "Horizon",
      definition: "Temporal reference for possible futures.",
    };


    const purpose: KernelConcept = {
      id: "purpose",
      name: "Purpose",
      definition: "Meaningful direction.",
    };


    const orientation: EcosystemOrientation = {
      horizon,
      purpose,
      coherent: true,
    };


    expect(orientation.horizon)
      .toBe(horizon);

    expect(orientation.purpose)
      .toBe(purpose);

    expect(orientation.coherent)
      .toBe(true);

  });

});