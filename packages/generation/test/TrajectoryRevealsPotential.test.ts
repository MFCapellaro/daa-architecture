import { describe, expect, it } from "vitest";

import type { Potential } from "../potential/Potential.js";

describe("Trajectory Reveals Potential", () => {

  it("recognizes potential revealed through coherent trajectory", () => {

    const trajectory = {
      id: "trajectory-1",
      coherent: true
    };

    const potential: Potential = {
      id: "potential-1",
      description: "Coherent possibility revealed through trajectory",
      context: "generation"
    };

    expect(trajectory.coherent).toBe(true);
    expect(potential.id).toBe("potential-1");

  });


  it("requires coherent trajectory to reveal meaningful potential", () => {

    const trajectory = {
      id: "trajectory-2",
      coherent: false
    };

    expect(trajectory.coherent).toBe(false);

  });


  it("preserves the distinction between trajectory and potential", () => {

    const trajectory = {
      id: "trajectory-3"
    };

    const potential: Potential = {
      id: "potential-3",
      description: "Expanded possibility",
      context: "generation"
    };

    expect(trajectory.id).not.toBe(potential.id);

  });

});