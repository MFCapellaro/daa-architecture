import { describe, expect, it } from "vitest";

import { Meaning } from "../../kernel/concepts/Meaning.js";

import { Recognition } from "../Recognition.js";
import { Transmittance } from "../Transmittance.js";

describe("Transmittance", () => {

  it("preserves recognition across contexts", () => {

    const recognition = Recognition.of(
      Meaning,
      "kernel"
    );

    const transmittance = Transmittance.of(
      recognition,
      "kernel",
      "lux"
    );

    expect(transmittance.recognition)
      .toBe(recognition);

    expect(transmittance.sourceContext)
      .toBe("kernel");

    expect(transmittance.targetContext)
      .toBe("lux");

  });

});