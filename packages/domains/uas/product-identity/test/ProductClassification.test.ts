import { describe, expect, it } from "vitest";

import {
  createProductCapability,
  type ProductCapability,
} from "../src/product/ProductCapability.js";

import {
  classifyCapability,
  type ProductClassification,
} from "../src/classification/ProductClassification.js";

import {
  createProductClass,
  type ProductClass,
} from "../src/classification/ProductClass.js";

describe("ProductClassification", () => {
  const capability: ProductCapability =
    createProductCapability(
      "agrass-t50-liquid-application",
      "AGRAS-T50",
      "Liquid Application",
      ["liquid-application"],
      ["liquid-storage:enables:liquid-application"],
    );

  const productClass: ProductClass =
    createProductClass(
      "agricultural-uav",
      "Agricultural UAV",
      "UAS",
      "Unmanned aerial systems for agricultural operations.",
    );

  it("classifies a product capability within a product class", () => {
    const classification = classifyCapability(
      capability,
      productClass,
      "cross-brand",
    );

    expect(classification.id).toBe(
      "agrass-t50-liquid-application:agricultural-uav",
    );

    expect(classification.capability).toBe(capability);
    expect(classification.productClass).toBe(productClass);
    expect(classification.scope).toBe("cross-brand");
  });

  it("preserves the product capability identity", () => {
    const classification: ProductClassification =
      classifyCapability(
        capability,
        productClass,
        "intra-brand",
      );

    expect(classification.capability.id).toBe(
      "agrass-t50-liquid-application",
    );

    expect(classification.capability.productId).toBe(
      "AGRAS-T50",
    );

    expect(classification.capability.name).toBe(
      "Liquid Application",
    );

    expect(classification.capability.functionIds).toEqual([
      "liquid-application",
    ]);

    expect(classification.capability.relationshipIds).toEqual([
      "liquid-storage:enables:liquid-application",
    ]);
  });

  it("preserves the classification scope", () => {
    const intraBrand = classifyCapability(
      capability,
      productClass,
      "intra-brand",
    );

    const crossBrand = classifyCapability(
      capability,
      productClass,
      "cross-brand",
    );

    expect(intraBrand.scope).toBe("intra-brand");
    expect(crossBrand.scope).toBe("cross-brand");
  });

  it("rejects an empty capability id", () => {
    expect(() =>
      createProductCapability(
        "",
        "AGRAS-T50",
        "Liquid Application",
        ["liquid-application"],
      ),
    ).toThrow(
      "Product capability id cannot be empty.",
    );
  });

  it("rejects an empty product id", () => {
    expect(() =>
      createProductCapability(
        "agrass-t50-liquid-application",
        "",
        "Liquid Application",
        ["liquid-application"],
      ),
    ).toThrow(
      "Product capability productId cannot be empty.",
    );
  });

  it("rejects an empty capability name", () => {
    expect(() =>
      createProductCapability(
        "agrass-t50-liquid-application",
        "AGRAS-T50",
        "",
        ["liquid-application"],
      ),
    ).toThrow(
      "Product capability name cannot be empty.",
    );
  });

  it("requires at least one function", () => {
    expect(() =>
      createProductCapability(
        "agrass-t50-liquid-application",
        "AGRAS-T50",
        "Liquid Application",
        [],
      ),
    ).toThrow(
      "Product capability requires at least one function.",
    );
  });
});
