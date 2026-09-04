import { describe, expect, it } from "vitest";

import type { SemanticProduct } from "../src/product/SemanticProduct.js";
import { createProductClass } from "../src/classification/ProductClass.js";
import { createComparison } from "../src/comparison/Comparison.js";
import {
createComparisonRelationship,
} from "../src/comparison/ComparisonRelationship.js";
import {
normalizeCharacteristic,
} from "../src/normalization/CharacteristicNormalization.js";

describe("ComparisonRelationship", () => {
it("creates a semantic relationship between comparison participants", () => {
const productClass = createProductClass(
"agricultural-spraying-uav",
"Agricultural Spraying UAV",
"uas",
"UAV designed for agricultural spraying operations.",
);

const productA = {
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
  productClass: {
    id: productClass.id,
    name: productClass.name,
  },
} as SemanticProduct;

const productB = {
  id: "xag-p150",
  name: "P150",
  model: "P150",
  manufacturer: {
    id: "xag",
    name: "XAG",
  },
  functions: [],
  capabilities: [],
  characteristics: [],
  productClass: {
    id: productClass.id,
    name: productClass.name,
  },
} as SemanticProduct;

const characteristic = normalizeCharacteristic(
  {
    id: "t50-payload-capacity",
    name: "Operating Payload",
    value: 40,
    unit: "kg",
    observationId: "t50-observation-05",
  },
  "payload-capacity",
  "Payload Capacity",
);

const comparison = createComparison(
  "agricultural-spraying-uav:dji-t50:xag-p150",
  productClass,
  [productA, productB],
  [characteristic],
  "prepared",
);

const relationship = createComparisonRelationship(
  comparison,
  productA.id,
  productB.id,
  characteristic,
  "similar",
);

expect(relationship.id).toBe(
  "agricultural-spraying-uav:dji-t50:xag-p150:dji-agras-t50:xag-p150:payload-capacity:similar",
);

expect(relationship.comparisonId).toBe(
  comparison.id,
);

expect(relationship.sourceId).toBe(
  productA.id,
);

expect(relationship.targetId).toBe(
  productB.id,
);

expect(relationship.characteristicId).toBe(
  characteristic.id,
);

expect(relationship.type).toBe("similar");

});

it("rejects participants outside the comparison", () => {
const productClass = createProductClass(
"agricultural-spraying-uav",
"Agricultural Spraying UAV",
"uas",
"UAV designed for agricultural spraying operations.",
);

const productA = {
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
  productClass: {
    id: productClass.id,
    name: productClass.name,
  },
} as SemanticProduct;

const productB = {
  id: "xag-p150",
  name: "P150",
  model: "P150",
  manufacturer: {
    id: "xag",
    name: "XAG",
  },
  functions: [],
  capabilities: [],
  characteristics: [],
  productClass: {
    id: productClass.id,
    name: productClass.name,
  },
} as SemanticProduct;

const characteristic = normalizeCharacteristic(
  {
    id: "t50-payload-capacity",
    name: "Operating Payload",
    value: 40,
    unit: "kg",
    observationId: "t50-observation-05",
  },
  "payload-capacity",
  "Payload Capacity",
);

const comparison = createComparison(
  "agricultural-spraying-uav:dji-t50:xag-p150",
  productClass,
  [productA, productB],
  [characteristic],
  "prepared",
);

expect(() =>
  createComparisonRelationship(
    comparison,
    productA.id,
    "unknown-product",
    characteristic,
    "different",
  ),
).toThrow(
  "Comparison relationship target must belong to the comparison.",
);

});
});
