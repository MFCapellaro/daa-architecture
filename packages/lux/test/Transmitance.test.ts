import { describe, expect, it } from "vitest";

import { Meaning } from "../../kernel/concepts/Meaning.js";

import { Recognition } from "../Recognition.js";
import { Transmitance } from "../Transmitance.js";

describe("Transmitance", () => {

  it("preserves recognition across contexts", () => {

    const recognition = Recognition.of(
      Meaning,
      "kernel"
    );

    const transmitance = Transmitance.of(
      recognition,
      "kernel",
      "lux"
    );

    expect(transmitance.recognition)
      .toBe(recognition);

    expect(transmitance.sourceContext)
      .toBe("kernel");

    expect(transmitance.targetContext)
      .toBe("lux");

  });

});