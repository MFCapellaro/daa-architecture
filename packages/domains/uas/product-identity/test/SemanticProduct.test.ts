import { describe, expect, it } from "vitest"

import {
  createProductCapability,
  type ProductCapability,
} from "../src/product/ProductCapability.js"

import type { SemanticProduct } from "../src/product/SemanticProduct.js"

import { createProductClass } from "../src/classification/ProductClass.js"

import { classifyCapability } from "../src/classification/ProductClassification.js"

import { createProductClassReference } from "../src/product/SemanticProductClassification.js"

describe("SemanticProduct", () => {
  it("represents a product independently from its source structure", () => {
    const capability: ProductCapability =
      createProductCapability(
        "dji-agras-t50-liquid-application",
        "dji-agras-t50",
        "Liquid Application",
        ["liquid-application"],
      )

    const product: SemanticProduct = {
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
        id: "agricultural-spraying-drone",
        name: "Agricultural Spraying Drone",
      },

      functions: [
        {
          id: "liquid-application",
          name: "Liquid Application",
        },
      ],

      capabilities: [capability],

      characteristics: [
        {
          id: "liquid-payload-capacity",
          name: "Liquid Payload Capacity",
          value: 40,
          unit: "L",
        },
      ],
    }

    expect(product.id).toBe("dji-agras-t50")
    expect(product.manufacturer.id).toBe("dji")
    expect(product.family?.id).toBe("dji-agras")
    expect(product.productClass?.id).toBe(
      "agricultural-spraying-drone",
    )

    expect(product.functions).toHaveLength(1)
    expect(product.capabilities).toHaveLength(1)
    expect(product.capabilities[0].productId).toBe(
      "dji-agras-t50",
    )
    expect(product.capabilities[0].functionIds).toEqual([
      "liquid-application",
    ])

    expect(product.characteristics).toHaveLength(1)
  })
})

describe("SemanticProduct classification", () => {
  it("creates a ProductClassReference from a ProductClassification", () => {
    const capability = createProductCapability(
      "dji-agras-t50-liquid-application",
      "dji-agras-t50",
      "Liquid Application",
      ["liquid-application"],
    )

    const productClass = createProductClass(
      "agricultural-spraying-uav",
      "Agricultural Spraying UAV",
      "uas",
      "UAV designed for agricultural spraying operations.",
    )

    const classification = classifyCapability(
      capability,
      productClass,
      "cross-brand",
    )

    const reference = createProductClassReference(
      classification,
    )

    expect(reference).toEqual({
      id: productClass.id,
      name: productClass.name,
    })

    expect(classification.capability.id).toBe(
      capability.id,
    )

    expect(classification.capability.productId).toBe(
      "dji-agras-t50",
    )

    expect(classification.productClass.id).toBe(
      reference.id,
    )
  })
})
