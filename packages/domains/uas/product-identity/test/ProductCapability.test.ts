import { describe, expect, it } from "vitest";

import {
  createProductCapability,
  type ProductCapability,
} from "../src/product/ProductCapability.js";

describe("ProductCapability", () => {
  it("creates a product capability from a functional structure", () => {
    const capability = createProductCapability(
      "agr-as-treatment",
      "dji-agras-t50",
      "Agricultural Treatment",
      ["movement", "liquid-application"],
      ["movement:enables:liquid-application"],
    );

    expect(capability).toEqual({
      id: "agr-as-treatment",
      productId: "dji-agras-t50",
      name: "Agricultural Treatment",
      functionIds: ["movement", "liquid-application"],
      relationshipIds: ["movement:enables:liquid-application"],
    });
  });

  it("allows a capability to emerge from a single function", () => {
    const capability = createProductCapability(
      "liquid-application",
      "dji-agras-t50",
      "Liquid Application",
      ["liquid-application"],
    );

    expect(capability.functionIds).toEqual(["liquid-application"]);
    expect(capability.relationshipIds).toEqual([]);
  });

  it("allows a capability to emerge from multiple functions", () => {
    const capability = createProductCapability(
      "autonomous-treatment",
      "dji-agras-t50",
      "Autonomous Treatment",
      [
        "positioning",
        "navigation",
        "path-planning",
        "movement",
        "liquid-application",
      ],
    );

    expect(capability.functionIds).toHaveLength(5);
  });

  it("rejects an empty capability id", () => {
    expect(() =>
      createProductCapability(
        "",
        "dji-agras-t50",
        "Liquid Application",
        ["liquid-application"],
      ),
    ).toThrow("Product capability id cannot be empty.");
  });

  it("rejects an empty product id", () => {
    expect(() =>
      createProductCapability(
        "liquid-application",
        "",
        "Liquid Application",
        ["liquid-application"],
      ),
    ).toThrow("Product capability productId cannot be empty.");
  });

  it("rejects an empty capability name", () => {
    expect(() =>
      createProductCapability(
        "liquid-application",
        "dji-agras-t50",
        "",
        ["liquid-application"],
      ),
    ).toThrow("Product capability name cannot be empty.");
  });

  it("rejects a capability without functions", () => {
    expect(() =>
      createProductCapability(
        "liquid-application",
        "dji-agras-t50",
        "Liquid Application",
        [],
      ),
    ).toThrow(
      "Product capability requires at least one function.",
    );
  });

  it("preserves the functional evidence without redefining it", () => {
    const functionIds = [
      "movement",
      "liquid-application",
    ] as const;

    const relationshipIds = [
      "movement:enables:liquid-application",
    ] as const;

    const capability: ProductCapability =
      createProductCapability(
        "agricultural-treatment",
        "dji-agras-t50",
        "Agricultural Treatment",
        functionIds,
        relationshipIds,
      );

    expect(capability.functionIds).toBe(functionIds);
    expect(capability.relationshipIds).toBe(relationshipIds);
  });
});