/**
 * DAA UAS Pool
 * ------------------------------
 * Test: PoolOffer
 *
 * Validates that a supplier can define
 * a collective opportunity.
 */

import { describe, expect, it } from "vitest";
import type { PoolOffer } from "../src/PoolOffer.js";

describe("PoolOffer", () => {
  it("should define a structured collective opportunity", () => {
    const offer: PoolOffer = {
      id: "offer-001",
      supplierId: "supplier-001",
      title: "Agricultural Drone Pool",
      unitPrice: 10000,
      formationLevels: [
        {
          units: 3,
          price: 9300
        },
        {
          units: 6,
          price: 8700
        },
        {
          units: 9,
          price: 8000
        }
      ]
    };

    expect(offer.supplierId).toBe("supplier-001");
    expect(offer.formationLevels).toHaveLength(3);
  });

  it("should represent progressive collective value", () => {
    const offer: PoolOffer = {
      id: "offer-002",
      supplierId: "supplier-002",
      title: "Equipment Pool",
      unitPrice: 5000,
      formationLevels: [
        {
          units: 3,
          price: 4500
        },
        {
          units: 6,
          price: 4000
        },
        {
          units: 9,
          price: 3500
        }
      ]
    };

    const firstLevel = offer.formationLevels[0];
    const finalLevel = offer.formationLevels[2];

    expect(finalLevel.price).toBeLessThan(firstLevel.price);
  });
});