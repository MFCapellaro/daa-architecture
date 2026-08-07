import { describe, expect, it } from "vitest";

import type { Interaction } from "../interaction/Interaction.js";

describe("Compatibility Precedes Interaction", () => {

  it("recognizes compatibility as a prior condition for interaction", () => {

    const compatibility = {
      id: "compatibility-1",
      coherent: true
    };

    const interaction: Interaction = {
        id: "interaction-1",
        participants: [
        "participant-1",
        "participant-2"
        ],
        coherent: true
    };

    expect(compatibility.coherent).toBe(true);
    expect(interaction.id).toBe("interaction-1");

  });


  it("does not consider non-coherent alignment as generative compatibility", () => {

    const compatibility = {
      id: "compatibility-2",
      coherent: false
    };

    expect(compatibility.coherent).toBe(false);

  });


  it("preserves the generative order", () => {

    const flow = [
      "Potential",
      "Compatibility",
      "Interaction"
    ];

    expect(flow.indexOf("Compatibility"))
      .toBeLessThan(flow.indexOf("Interaction"));

  });

});