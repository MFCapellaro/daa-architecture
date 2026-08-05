import { describe, expect, it } from "vitest";

import { Meaning } from "../../kernel/concepts/Meaning.js";

import { Recognition } from "../Recognition.js";
import { Transmittance } from "../Transmittance.js";
import { Propagation } from "../Propagation.js";

describe("Propagation", () => {

  it("propagates transmitted coherence into a context", () => {

    const recognition = Recognition.of(
      Meaning,
      "kernel"
    );

    const transmittance = Transmittance.of(
      recognition,
      "kernel",
      "lux"
    );

    const propagation = Propagation.of(
      transmittance,
      "community"
    );

    expect(propagation.transmittance)
      .toBe(transmittance);

    expect(propagation.context)
      .toBe("community");

  });

});