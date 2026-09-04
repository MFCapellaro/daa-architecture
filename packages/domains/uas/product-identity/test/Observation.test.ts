import { describe, expect, it } from "vitest";

import type {
EvidenceStatus,
Observation,
} from "../src/observation/Observation.js";

describe("Observation", () => {
it("preserves an observed product value and its context", () => {
const observation: Observation = {
id: "observation-01",
rawLabel: "Weight",
observedValue: 39.9,
unit: "kg",
context: "Aircraft",
condition: "Excluding battery",
sources: ["source-02"],
evidenceStatus: "observed",
};

expect(observation.rawLabel).toBe("Weight");
expect(observation.observedValue).toBe(39.9);
expect(observation.unit).toBe("kg");
expect(observation.context).toBe("Aircraft");
expect(observation.condition).toBe("Excluding battery");
expect(observation.sources).toEqual(["source-02"]);
expect(observation.evidenceStatus).toBe("observed");

});

it("preserves contextual differences between observations", () => {
const twoSprinklers: Observation = {
id: "observation-08",
rawLabel: "Max Flow Rate",
observedValue: 16,
unit: "L/min",
context: "Spraying, two sprinklers",
observedSystem: "Delivery Pumps",
sources: ["source-01", "source-02"],
evidenceStatus: "corroborated",
};

const fourSprinklers: Observation = {
  id: "observation-09",
  rawLabel: "Max Flow Rate",
  observedValue: 24,
  unit: "L/min",
  context: "Spraying, four sprinklers",
  observedSystem: "Delivery Pumps",
  sources: ["source-01", "source-02"],
  evidenceStatus: "corroborated",
};

expect(twoSprinklers.rawLabel).toBe(fourSprinklers.rawLabel);
expect(twoSprinklers.observedValue).not.toBe(
  fourSprinklers.observedValue,
);
expect(twoSprinklers.context).not.toBe(
  fourSprinklers.context,
);

});

it("preserves ranges without normalization", () => {
const observation: Observation = {
id: "observation-07",
rawLabel: "Droplet Size",
observedValue: "50–500",
unit: "μm",
context: "Spraying",
observedSystem: "Dual Atomizing Spraying System",
sources: ["source-01", "source-02"],
evidenceStatus: "corroborated",
};

expect(observation.observedValue).toBe("50–500");
expect(observation.unit).toBe("μm");

});

it("represents unresolved evidence without discarding the observation", () => {
const status: EvidenceStatus = "unresolved";

const observation: Observation = {
  id: "observation-17",
  rawLabel: "Binocular Vision Measurement Range",
  observedValue: "0.5–29",
  unit: "m",
  context: "Vision sensing",
  observedSystem: "Binocular Vision System",
  sources: ["source-03"],
  evidenceStatus: status,
};

expect(observation.evidenceStatus).toBe("unresolved");
expect(observation.observedValue).toBe("0.5–29");

});
});
