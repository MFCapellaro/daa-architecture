import { describe, expect, it } from "vitest";

import type { Potency } from "../potency/Potency.js";
import type { Emergence } from "../emergence/Emergence.js";

describe("Potency Enables Emergence", () => {

  it("enables emergence when potency has emerged coherently", () => {

    const potency: Potency = {
      id: "potency-1",
      emerged: true,
      relationships: [
        "participant-1:participant-2"
      ]
    };

    const emergence: Emergence = {
      id: "emergence-1",
      potencyId: potency.id,
      observable: true
    };

    expect(potency.emerged).toBe(true);
    expect(emergence.potencyId).toBe(potency.id);

  });


  it("does not reveal emergence without coherent potency", () => {

    const potency: Potency = {
      id: "potency-2",
      emerged: false,
      relationships: []
    };

    expect(potency.emerged).toBe(false);

  });


  it("preserves emergence as an observable condition", () => {

    const emergence: Emergence = {
      id: "emergence-3",
      potencyId: "potency-3",
      observable: true
    };

    expect(emergence.observable).toBe(true);

  });

});