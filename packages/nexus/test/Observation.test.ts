import { describe, expect, test } from "vitest";

import type { EcosystemObservation } from "../src/observation/EcosystemObservation.js";

describe("Ecosystem Observation", () => {

  test("should preserve observable ecosystem elements", () => {

    const observation: EcosystemObservation = {
      identities: [],
      capabilities: [],
      relationships: [],
    };

    expect(observation.identities)
      .toEqual([]);

    expect(observation.capabilities)
      .toEqual([]);

    expect(observation.relationships)
      .toEqual([]);

  });

});