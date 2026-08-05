import { describe, expect, it } from "vitest";
import { Interaction } from "../interaction/Interaction.js";

describe("Interaction", () => {
  it("should preserve interaction identity", () => {
    const interaction: Interaction = {
      id: "interaction-001",
      participants: ["potential-a", "potential-b"],
      coherent: true,
    };

    expect(interaction.id).toBe("interaction-001");
    expect(interaction.participants).toHaveLength(2);
    expect(interaction.coherent).toBe(true);
  });

  it("should represent relationships between compatible potentials", () => {
    const interaction: Interaction = {
      id: "interaction-002",
      participants: ["potential-a", "potential-b"],
      coherent: true,
      relationships: ["relationship-001"],
    };

    expect(interaction.relationships).toContain("relationship-001");
  });
});