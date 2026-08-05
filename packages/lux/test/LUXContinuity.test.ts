import { describe, expect, it } from "vitest";

import { Meaning } from "../../kernel/concepts/Meaning.js";

import { Recognition } from "../Recognition.js";
import { Transmittance } from "../Transmittance.js";
import { Propagation } from "../Propagation.js";


describe("LUX continuity", () => {

  it("preserves coherent identity across contexts", () => {

    const recognition = Recognition.of(
      Meaning,
      "kernel"
    );


    const transmittance = Transmittance.of(
      recognition,
      "kernel",
      "ecosystem"
    );


    const propagation = Propagation.of(
      transmittance,
      "community"
    );


    expect(
      propagation.transmittance.recognition.coherence
    )
      .toBe(Meaning);


    expect(
      propagation.transmittance.recognition.context
    )
      .toBe("kernel");


    expect(
      propagation.context
    )
      .toBe("community");

  });

});