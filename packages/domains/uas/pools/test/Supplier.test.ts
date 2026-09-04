/**
 * DAA UAS Pool
 * ------------------------------
 * Test: Supplier
 *
 * Validates that a supplier
 * can define identity and capability.
 */

import { describe, expect, it } from "vitest";
import type { Supplier } from "../src/Supplier.js";

describe("Supplier", () => {
  it("should define a supplier with identity and capabilities", () => {
    const supplier: Supplier = {
      id: "supplier-001",
      name: "UAS Provider",
      capabilities: [
        "Agricultural drones",
        "Technical support"
      ]
    };

    expect(supplier.id).toBe("supplier-001");
    expect(supplier.name).toBe("UAS Provider");
    expect(supplier.capabilities).toContain("Agricultural drones");
  });

  it("should allow contextual location", () => {
    const supplier: Supplier = {
      id: "supplier-002",
      name: "Regional Provider",
      capabilities: [
        "Drone service"
      ],
      location: "Argentina"
    };

    expect(supplier.location).toBe("Argentina");
  });
});