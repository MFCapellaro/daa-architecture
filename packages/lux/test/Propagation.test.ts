import { describe, expect, it } from "vitest";

import { Meaning } from "../../kernel/concepts/Meaning.js";

import { Recognition } from "../Recognition.js";
import { Transmitance } from "../Transmitance.js";
import { Propagation } from "../Propagation.js";

describe("Propagation", () => {

  it("propagates transmitted coherence into a context", () => {

    const recognition = Recognition.of(
      Meaning,
      "kernel"
    );

    const transmitance = Transmitance.of(
      recognition,
      "kernel",
      "lux"
    );

    const propagation = Propagation.of(
      transmitance,
      "community"
    );

    expect(propagation.transmitance)
      .toBe(transmitance);

    expect(propagation.context)
      .toBe("community");

  });

});