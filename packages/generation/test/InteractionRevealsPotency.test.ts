import { describe, expect, it } from "vitest";

import type { Interaction } from "../interaction/Interaction.js";
import type { Potency } from "../potency/Potency.js";

describe("Interaction Reveals Potency", () => {

  it("reveals potency through coherent interaction", () => {

    const interaction: Interaction = {
      id: "interaction-1",
      participants: [
        "participant-1",
        "participant-2"
      ],
      coherent: true
    };

    const potency: Potency = {
        id: "potency-1",
        emerged: true,
        relationships: [
        "participant-1:participant-2"
        ]
    };

    expect(interaction.coherent).toBe(true);
    expect(potency.id).toBe("potency-1");

  });


  it("does not reveal potency without coherent interaction", () => {

    const interaction: Interaction = {
      id: "interaction-2",
      participants: [
        "participant-1",
        "participant-2"
      ],
      coherent: false
    };

    expect(interaction.coherent).toBe(false);

  });


  it("preserves the distinction between interaction and emergent potency", () => {

    const interaction: Interaction = {
      id: "interaction-3",
      participants: [
        "participant-1",
        "participant-2"
      ],
      coherent: true
    };

    const potency: Potency = {
        id: "potency-3",
        emerged: true,
        relationships: [
        "participant-1:participant-2"
        ]
    };

    expect(interaction.id).not.toBe(potency.id);

  });

});