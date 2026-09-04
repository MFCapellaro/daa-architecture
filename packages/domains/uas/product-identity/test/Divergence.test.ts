import { describe, expect, it } from "vitest";

import type { Observation } from "../src/observation/Observation.js";
import {
createDivergence,
} from "../src/convergence/Divergence.js";

describe("Divergence", () => {
it("creates a divergence from distinct observations", () => {
const observationA = {
id: "xag-p150-payload",
} as Observation;

const observationB = {
  id: "xag-p150-max-payload",
} as Observation;

const divergence = createDivergence(
  "payload-capacity-divergence",
  [observationA, observationB],
  "structural",
  "recurring",
);

expect(divergence.id).toBe(
  "payload-capacity-divergence",
);

expect(divergence.observations).toHaveLength(2);
expect(divergence.level).toBe("structural");
expect(divergence.state).toBe("recurring");

});

it("requires at least two observations", () => {
const observation = {
id: "xag-p150-payload",
} as Observation;

expect(() =>
  createDivergence(
    "single-observation",
    [observation],
    "structural",
    "observed",
  ),
).toThrow(
  "Divergence requires at least two observations.",
);

});

it("rejects duplicated observations", () => {
const observation = {
id: "xag-p150-payload",
} as Observation;

expect(() =>
  createDivergence(
    "duplicated-observations",
    [observation, observation],
    "structural",
    "recurring",
  ),
).toThrow(
  "Divergence observations must be distinct.",
);

});
});
