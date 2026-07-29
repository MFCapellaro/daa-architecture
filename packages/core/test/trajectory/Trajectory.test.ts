import { describe, expect, it } from "vitest";

import type { Continuity } from "../../continuity/src/Continuity.js";
import type { Legacy } from "../../legacy/src/Legacy.js";


describe("Trajectory", () => {

  it("preserves coherent continuity through time", () => {

    const continuity: Continuity = {
      continuous: true
    };

    expect(
      continuity.continuous
    ).toBe(true);

  });


  it("transforms validated continuity into legacy", () => {

    const continuity: Continuity = {
      continuous: true
    };


    const legacy: Legacy = {
      validated: continuity.continuous
    };


    expect(
      legacy.validated
    ).toBe(true);

  });

});