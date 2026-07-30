import { describe, expect, it } from "vitest";

import { CoherenceTransformation } from "../laws/CoherenceTransformation.js";
import type { KernelConcept } from "../KernelConcept.js";


describe("CoherenceTransformation Law", () => {

  it("transforms variability into coherent movement while preserving identity", () => {

    const coherence: KernelConcept = {
      id: "coherence",
      name: "Coherence",
      definition: "The principle that organizes adaptive relationships."
    };

    const variability: KernelConcept = {
      id: "variability",
      name: "Variability",
      definition: "Changing conditions that generate movement."
    };

    const movement: KernelConcept = {
      id: "movement",
      name: "Movement",
      definition: "Adaptive response under changing conditions."
    };

    const identity: KernelConcept = {
      id: "identity",
      name: "Identity",
      definition: "The persistent center of the system."
    };


    const law = CoherenceTransformation(
      coherence,
      variability,
      movement,
      identity
    );


    expect(law.relationships).toHaveLength(3);

    expect(law.relationships[0].verb)
      .toBe("generates");

    expect(law.relationships[1].verb)
      .toBe("organizes");

    expect(law.relationships[2].verb)
      .toBe("preserves");

  });

});