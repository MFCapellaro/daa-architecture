import { describe, expect, it } from "vitest";

import type { SemanticProduct } from "../src/product/SemanticProduct.js";
import { createProductClass } from "../src/classification/ProductClass.js";
import { createComparison, } from "../src/comparison/Comparison.js";
import { normalizeCharacteristic } from "../src/normalization/CharacteristicNormalization.js";

describe("Comparison", () => {
it("creates a comparison within a shared Product Class", () => {
const productClass = createProductClass(
"agricultural-spraying-uav",
"Agricultural Spraying UAV",
"uas",
"UAV designed for agricultural spraying operations.",
);

const productA: SemanticProduct = {
  id: "dji-agras-t50",
  name: "AGRAS T50",
  model: "T50",
  manufacturer: {
    id: "dji",
    name: "DJI",
  },
  family: {
    id: "dji-agras",
    name: "AGRAS",
  },
  productClass: {
    id: productClass.id,
    name: productClass.name,
  },
  functions: [],
  capabilities: [],
  characteristics: [],
};

const productB: SemanticProduct = {
  id: "xag-p150",
  name: "P150",
  model: "P150",
  manufacturer: {
    id: "xag",
    name: "XAG",
  },
  family: {
    id: "xag-p-series",
    name: "P Series",
  },
  productClass: {
    id: productClass.id,
    name: productClass.name,
  },
  functions: [],
  capabilities: [],
  characteristics: [],
};

const characteristic = {
  id: "t50-payload-capacity",
  name: "Operating Payload",
  value: 40,
  unit: "kg",
  observationId: "t50-observation-05",
};

const normalizedCharacteristic = normalizeCharacteristic(
  characteristic,
  "payload-capacity",
  "Payload Capacity",
);

const comparison = createComparison(
  "agricultural-spraying-uav:dji-t50:xag-p150",
  productClass,
  [productA, productB],
  [normalizedCharacteristic],
  "prepared",
);

expect(comparison.id).toBe(
  "agricultural-spraying-uav:dji-t50:xag-p150",
);

expect(comparison.productClass.id).toBe(
  productClass.id,
);

expect(comparison.products).toHaveLength(2);

expect(comparison.characteristics).toHaveLength(1);

expect(comparison.characteristics[0]).toEqual({
  id: "payload-capacity",
  name: "Payload Capacity",
  value: 40,
  unit: "kg",
  characteristicId: "t50-payload-capacity",
});

expect(comparison.state).toBe("prepared");

});

it("rejects comparisons with fewer than two products", () => {
const productClass = createProductClass(
"agricultural-spraying-uav",
"Agricultural Spraying UAV",
"uas",
"UAV designed for agricultural spraying operations.",
);

const product = {
  id: "dji-agras-t50",
  name: "AGRAS T50",
  model: "T50",
  manufacturer: {
    id: "dji",
    name: "DJI",
  },
  functions: [],
  capabilities: [],
  characteristics: [],
} as SemanticProduct;

expect(() =>
  createComparison(
    "invalid-comparison",
    productClass,
    [product],
    [],
    "prepared",
  ),
).toThrow(
  "A comparison requires at least two products.",
);

});
});
