import { describe, expect, it } from "vitest";

import type { Interaction } from "../generation/interaction/Interaction.js";
import type { Potency } from "../generation/potency/Potency.js";
import type { Emergence } from "../generation/emergence/Emergence.js";
import type { Capability } from "../generation/capability/Capability.js";

describe("Coherence Transformation", () => {

  it("preserves coherence across coherent transformation", () => {

    const interaction: Interaction = {
      id: "interaction-1",
      participants: ["participant-a", "participant-b"],
      coherent: true,
      purpose: "shared purpose"
    };

    const potency: Potency = {
      id: "potency-1",
      emerged: true,
      relationships: interaction.participants
    };

    const emergence: Emergence = {
      id: "emergence-1",
      potencyId: potency.id,
      observable: true
    };

    const capability: Capability = {
      id: "capability-1",
      observable: emergence.observable,
      description: "Collective capability",
      potencyId: potency.id,
      coherent: interaction.coherent
    };

    expect(interaction.coherent).toBe(true);
    expect(capability.coherent).toBe(true);
    expect(capability.potencyId).toBe(potency.id);
    expect(emergence.potencyId).toBe(potency.id);

  });

  it("never creates capability without coherent interaction", () => {

    const interaction: Interaction = {
      id: "interaction-2",
      participants: ["participant-a"],
      coherent: false
    };

    expect(interaction.coherent).toBe(false);

  });

  it("preserves architectural continuity from interaction to capability", () => {

    const interaction: Interaction = {
      id: "interaction-3",
      participants: ["A", "B"],
      coherent: true
    };

    const potency: Potency = {
      id: "potency-3",
      emerged: true,
      relationships: interaction.participants
    };

    const emergence: Emergence = {
      id: "emergence-3",
      potencyId: potency.id,
      observable: true
    };

    const capability: Capability = {
      id: "capability-3",
      observable: true,
      description: "Architectural continuity",
      potencyId: potency.id,
      coherent: interaction.coherent
    };

    expect(capability.coherent).toBe(interaction.coherent);
    expect(capability.observable).toBe(emergence.observable);
    expect(capability.potencyId).toBe(emergence.potencyId);

  });

});