import { describe, expect, it } from "vitest";

import type { Observation } from "../src/observation/Observation.js";
import {
createConvergence,
} from "../src/convergence/Convergence.js";

describe("Convergence", () => {
it("creates a convergence from distinct observations", () => {
const observationA = {
id: "dji-t50-payload",
} as Observation;

const observationB = {
  id: "xag-p150-payload",
} as Observation;

const convergence = createConvergence(
  "payload-capacity-convergence",
  [observationA, observationB],
  "lexical",
  "recurring",
);

expect(convergence.id).toBe(
  "payload-capacity-convergence",
);

expect(convergence.observations).toHaveLength(2);
expect(convergence.level).toBe("lexical");
expect(convergence.state).toBe("recurring");

});

it("requires at least two observations", () => {
const observation = {
id: "dji-t50-payload",
} as Observation;

expect(() =>
  createConvergence(
    "single-observation",
    [observation],
    "lexical",
    "observed",
  ),
).toThrow(
  "Convergence requires at least two observations.",
);

});

it("rejects duplicated observations", () => {
const observation = {
id: "dji-t50-payload",
} as Observation;

expect(() =>
  createConvergence(
    "duplicated-observations",
    [observation, observation],
    "lexical",
    "recurring",
  ),
).toThrow(
  "Convergence observations must be distinct.",
);

});
});
