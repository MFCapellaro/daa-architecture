import { describe, expect, it } from "vitest";

import type { RuntimeObservation } from "../RuntimeObservation.js";

describe("RuntimeObservation", () => {

  it("preserves observation identity", () => {

    const observation: RuntimeObservation = {

      id: "observation",

      name: "Runtime Observation",

      description: "Recognizes runtime signals."

    };

    expect(observation.id).toBe("observation");

    expect(observation.name).toBe("Runtime Observation");

  });

  it("preserves observation description", () => {

    const observation: RuntimeObservation = {

      id: "observation",

      name: "Runtime Observation",

      description: "Recognizes runtime signals."

    };

    expect(observation.description)
      .toBe("Recognizes runtime signals.");

  });

});