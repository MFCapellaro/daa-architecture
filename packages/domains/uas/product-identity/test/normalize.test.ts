import { describe, expect, it } from "vitest";

import type { Characteristic } from "../src/characteristic/Characteristic.js";
import { normalize } from "../src/normalization/normalize.js";
import type { NormalizationRule } from "../src/normalization/NormalizationRule.js";

describe("normalize", () => {
it("applies an explicit normalization rule", () => {
const characteristic: Characteristic = {
id: "max-flow-rate-two-sprinklers",
name: "Max Flow Rate",
value: 16,
unit: "L/min",
observationId: "observation-08",
};

const rule: NormalizationRule = {
  id: "maximum-spray-flow-rate",
  normalizedId: "maximum-spray-flow-rate",
  normalizedName: "Maximum Spray Flow Rate",
  characteristicIds: [
    "max-flow-rate-two-sprinklers",
    "max-flow-rate-four-sprinklers",
  ],
  contexts: ["Spraying"],
};

const normalized = normalize(characteristic, rule);

expect(normalized.id).toBe(
  "maximum-spray-flow-rate",
);
expect(normalized.name).toBe(
  "Maximum Spray Flow Rate",
);
expect(normalized.value).toBe(16);
expect(normalized.unit).toBe("L/min");
expect(normalized.characteristicId).toBe(
  characteristic.id,
);

});

it("does not alter the original characteristic", () => {
const characteristic: Characteristic = {
id: "max-flow-rate-four-sprinklers",
name: "Max Flow Rate",
value: 24,
unit: "L/min",
observationId: "observation-09",
};

const rule: NormalizationRule = {
  id: "maximum-spray-flow-rate",
  normalizedId: "maximum-spray-flow-rate",
  normalizedName: "Maximum Spray Flow Rate",
  characteristicIds: [
    "max-flow-rate-two-sprinklers",
    "max-flow-rate-four-sprinklers",
  ],
  contexts: ["Spraying"],
};

const normalized = normalize(characteristic, rule);

expect(characteristic.value).toBe(24);
expect(characteristic.name).toBe("Max Flow Rate");
expect(normalized.value).toBe(24);

});

it("rejects a characteristic that is not covered by the rule", () => {
const characteristic: Characteristic = {
id: "spread-width",
name: "Spread Width",
value: 8,
unit: "m",
observationId: "observation-13",
};

const rule: NormalizationRule = {
  id: "maximum-spray-flow-rate",
  normalizedId: "maximum-spray-flow-rate",
  normalizedName: "Maximum Spray Flow Rate",
  characteristicIds: [
    "max-flow-rate-two-sprinklers",
    "max-flow-rate-four-sprinklers",
  ],
  contexts: ["Spraying"],
};

expect(() => normalize(characteristic, rule)).toThrow(
  'Characteristic "spread-width" is not applicable',
);

});
});
