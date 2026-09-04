import { describe, expect, it } from "vitest";

import type { FunctionalDiscernment } from "../src/functional/FunctionalDiscernment.js";
import type { FunctionalRelationship } from "../src/functional/FunctionalRelationship.js";
import {
  createProductCapability,
  type ProductCapability,
} from "../src/product/ProductCapability.js";

describe("ProductCapability", () => {
  it("consolidates capability from a single product function", () => {
    const functionDiscernment: FunctionalDiscernment = {
      id: "hydro-sensitive-indication:Detect Moisture",
      characteristicId: "hydro-sensitive-indication",
      function: "Detect Moisture",
      context: "Agricultural Monitoring",
    };

    const capability: ProductCapability = createProductCapability(
      "moisture-detection",
      "hydro-sensitive-card",
      "Moisture Detection",
      [functionDiscernment.id],
    );

    expect(capability.id).toBe("moisture-detection");
    expect(capability.productId).toBe("hydro-sensitive-card");
    expect(capability.name).toBe("Moisture Detection");
    expect(capability.functionIds).toEqual([
      "hydro-sensitive-indication:Detect Moisture",
    ]);
  });

  it("consolidates capability from multiple product functions", () => {
    const functions: FunctionalDiscernment[] = [
      {
        id: "navigation:Position",
        characteristicId: "positioning-system",
        function: "Position",
        context: "Navigation",
      },
      {
        id: "navigation:Navigate",
        characteristicId: "navigation-system",
        function: "Navigate",
        context: "Navigation",
      },
      {
        id: "application:Apply Liquid",
        characteristicId: "spray-system",
        function: "Apply Liquid",
        context: "Agricultural Treatment",
      },
    ];

    const relationships: FunctionalRelationship[] = [
      {
        id: "navigation:Position:enables:navigation:Navigate",
        sourceFunctionId: functions[0].id,
        targetFunctionId: functions[1].id,
        relationship: "enables",
        context: "Navigation",
      },
      {
        id: "navigation:Navigate:enables:application:Apply Liquid",
        sourceFunctionId: functions[1].id,
        targetFunctionId: functions[2].id,
        relationship: "enables",
        context: "Agricultural Treatment",
      },
    ];

    const capability = createProductCapability(
      "agricultural-liquid-operation",
      "AGRAS-T50",
      "Agricultural Liquid Operation",
      functions.map((fn) => fn.id),
      relationships.map((relationship) => relationship.id),
    );

    expect(capability.productId).toBe("AGRAS-T50");
    expect(capability.functionIds).toHaveLength(3);
    expect(capability.relationshipIds).toHaveLength(2);
  });

  it("does not require observable behavior", () => {
    const capability = createProductCapability(
      "moisture-detection",
      "hydro-sensitive-card",
      "Moisture Detection",
      ["hydro-sensitive-indication:Detect Moisture"],
    );

    expect(capability).toEqual({
      id: "moisture-detection",
      productId: "hydro-sensitive-card",
      name: "Moisture Detection",
      functionIds: ["hydro-sensitive-indication:Detect Moisture"],
      relationshipIds: [],
    });
  });

  it("preserves product-level capability as an internal semantic layer", () => {
    const capability = createProductCapability(
      "spray-application",
      "AGRAS-T50",
      "Spray Application",
      ["spraying:Apply Liquid"],
    );

    expect(capability.functionIds).toContain(
      "spraying:Apply Liquid",
    );

    expect(capability).not.toHaveProperty("observable");
    expect(capability).not.toHaveProperty("potencyId");
    expect(capability).not.toHaveProperty("coherent");
    expect(capability).not.toHaveProperty("description");
  });
});