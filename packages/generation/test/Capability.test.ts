import { describe, expect, it } from "vitest";
import { Capability } from "../capability/Capability.js";

describe("Capability", () => {
  it("should represent observable emergent capability", () => {
    const capability: Capability = {
      id: "capability-001",
      observable: true,
      description: "Collective agricultural optimization",
      coherent: true,
    };

    expect(capability.observable).toBe(true);
    expect(capability.coherent).toBe(true);
  });

  it("should preserve connection with originating potency", () => {
    const capability: Capability = {
      id: "capability-002",
      observable: true,
      description: "Emergent capability",
      potencyId: "potency-001",
      coherent: true,
    };

    expect(capability.potencyId).toBe("potency-001");
  });
});