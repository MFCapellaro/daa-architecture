import { describe, expect, it } from "vitest";

import {
  createProductClass,
  type ProductClass,
} from "../src/classification/ProductClass.js";

describe("ProductClass", () => {
  it("creates a product class with semantic identity", () => {
    const productClass = createProductClass(
      "agricultural-spraying-uav",
      "Agricultural Spraying UAV",
      "UAS Product Classification",
      "UAV products whose functional identity includes agricultural spraying.",
    );

    expect(productClass.id).toBe(
      "agricultural-spraying-uav",
    );

    expect(productClass.name).toBe(
      "Agricultural Spraying UAV",
    );

    expect(productClass.scheme).toBe(
      "UAS Product Classification",
    );

    expect(productClass.description).toContain(
      "agricultural spraying",
    );
  });

  it("preserves the complete class identity", () => {
    const productClass: ProductClass =
      createProductClass(
        "agricultural-spreading-uav",
        "Agricultural Spreading UAV",
        "UAS Product Classification",
        "UAV products whose functional identity includes agricultural spreading.",
      );

    expect(productClass).toEqual({
      id: "agricultural-spreading-uav",
      name: "Agricultural Spreading UAV",
      scheme: "UAS Product Classification",
      description:
        "UAV products whose functional identity includes agricultural spreading.",
    });
  });

  it("rejects an empty class id", () => {
    expect(() =>
      createProductClass(
        "",
        "Agricultural Spraying UAV",
        "UAS Product Classification",
        "A valid product class.",
      ),
    ).toThrow(
      "Product Class id cannot be empty.",
    );
  });

  it("rejects an empty class name", () => {
    expect(() =>
      createProductClass(
        "agricultural-spraying-uav",
        "",
        "UAS Product Classification",
        "A valid product class.",
      ),
    ).toThrow(
      "Product Class name cannot be empty.",
    );
  });

  it("rejects an empty classification scheme", () => {
    expect(() =>
      createProductClass(
        "agricultural-spraying-uav",
        "Agricultural Spraying UAV",
        "",
        "A valid product class.",
      ),
    ).toThrow(
      "Product Class scheme cannot be empty.",
    );
  });

  it("rejects an empty description", () => {
    expect(() =>
      createProductClass(
        "agricultural-spraying-uav",
        "Agricultural Spraying UAV",
        "UAS Product Classification",
        "",
      ),
    ).toThrow(
      "Product Class description cannot be empty.",
    );
  });
});