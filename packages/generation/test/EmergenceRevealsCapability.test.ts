import { describe, expect, it } from "vitest";

import type { Emergence } from "../emergence/Emergence.js";
import type { Capability } from "../capability/Capability.js";

describe("Emergence Reveals Capability", () => {

  it("reveals capability when emergence becomes observable", () => {

    const emergence: Emergence = {
      id: "emergence-1",
      potencyId: "potency-1",
      observable: true
    };

    const capability: Capability = {
        id: "capability-1",
        description: "Collective capability generated through coherent interaction",
        observable: true,
        coherent: true
    };

    expect(emergence.observable).toBe(true);
    expect(capability.observable).toBe(true);
    expect(capability.coherent).toBe(true);

  });


  it("does not reveal capability from non-observable emergence", () => {

    const emergence: Emergence = {
      id: "emergence-2",
      potencyId: "potency-2",
      observable: false
    };

    expect(emergence.observable).toBe(false);

  });


  it("preserves distinction between emergence and capability", () => {

    const emergence: Emergence = {
      id: "emergence-3",
      potencyId: "potency-3",
      observable: true
    };

    const capability: Capability = {
        id: "capability-3",
        description: "Generated capability",
        observable: true,
        coherent: true
    };

    expect(emergence.id).not.toBe(capability.id);

  });

});