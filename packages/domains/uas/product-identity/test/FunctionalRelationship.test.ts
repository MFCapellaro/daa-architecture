import { describe, expect, it } from "vitest";

import type { FunctionalDiscernment } from "../src/functional/FunctionalDiscernment.js";
import {
  relateFunctions,
  type FunctionalRelationship,
} from "../src/functional/FunctionalRelationship.js";

describe("FunctionalRelationship", () => {
  it("relates two discerned functions", () => {
    const spraying: FunctionalDiscernment = {
      id: "maximum-spray-flow-rate:Deliver Spray Material",
      characteristicId: "maximum-spray-flow-rate",
      function: "Deliver Spray Material",
      context: "Spraying",
    };

    const atomization: FunctionalDiscernment = {
      id: "droplet-size:Atomize Spray Material",
      characteristicId: "droplet-size",
      function: "Atomize Spray Material",
      context: "Spraying",
    };

    const relationship = relateFunctions(
      atomization,
      spraying,
      "Enables",
      "Spraying",
    );

    expect(relationship.sourceFunctionId).toBe(
      atomization.id,
    );

    expect(relationship.targetFunctionId).toBe(
      spraying.id,
    );

    expect(relationship.relationship).toBe("Enables");
    expect(relationship.context).toBe("Spraying");
  });

  it("generates a deterministic relationship identity", () => {
    const source: FunctionalDiscernment = {
      id: "droplet-size:Atomize Spray Material",
      characteristicId: "droplet-size",
      function: "Atomize Spray Material",
      context: "Spraying",
    };

    const target: FunctionalDiscernment = {
      id: "maximum-spray-flow-rate:Deliver Spray Material",
      characteristicId: "maximum-spray-flow-rate",
      function: "Deliver Spray Material",
      context: "Spraying",
    };

    const relationship: FunctionalRelationship =
      relateFunctions(
        source,
        target,
        "Enables",
        "Spraying",
      );

    expect(relationship.id).toBe(
      `${source.id}:Enables:${target.id}`,
    );
  });

  it("preserves the direction of the functional relationship", () => {
    const source: FunctionalDiscernment = {
      id: "pump-flow:Deliver Material",
      characteristicId: "pump-flow",
      function: "Deliver Material",
      context: "Spraying",
    };

    const target: FunctionalDiscernment = {
      id: "spray-system:Apply Material",
      characteristicId: "spray-system",
      function: "Apply Material",
      context: "Spraying",
    };

    const relationship = relateFunctions(
      source,
      target,
      "Enables",
      "Spraying",
    );

    expect(relationship.sourceFunctionId).not.toBe(
      relationship.targetFunctionId,
    );
  });
});