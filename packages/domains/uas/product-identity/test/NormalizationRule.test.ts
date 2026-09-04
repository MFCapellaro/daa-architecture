import { describe, expect, it } from "vitest";

import type { NormalizationRule } from "../src/normalization/NormalizationRule.js";

describe("NormalizationRule", () => {
it("defines an explicit semantic convergence", () => {
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

expect(rule.normalizedId).toBe(
  "maximum-spray-flow-rate",
);

expect(rule.characteristicIds).toHaveLength(2);
expect(rule.contexts).toContain("Spraying");

});

it("can preserve contextual conditions", () => {
const rule: NormalizationRule = {
id: "aircraft-weight",
normalizedId: "aircraft-weight",
normalizedName: "Aircraft Weight",
characteristicIds: [
"weight-excluding-battery",
"weight-including-battery",
],
contexts: ["Aircraft"],
conditions: [
"Excluding battery",
"Including battery",
],
};

expect(rule.conditions).toContain("Excluding battery");
expect(rule.conditions).toContain("Including battery");

});

it("does not require a context when semantic identity is sufficient", () => {
const rule: NormalizationRule = {
id: "spread-width",
normalizedId: "spread-width",
normalizedName: "Spread Width",
characteristicIds: ["spread-width"],
};

expect(rule.contexts).toBeUndefined();
expect(rule.conditions).toBeUndefined();

});
});
