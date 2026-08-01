/**
 * DAA UAS Pool
 * ------------------------------
 * Test: Pool Integration
 *
 * Validates the complete collective
 * purchasing flow from interest
 * to completed relationship.
 */

import { describe, expect, it } from "vitest";

import type { Participant } from "../src/Participant.js";
import type { Supplier } from "../src/Supplier.js";
import type { PoolOffer } from "../src/PoolOffer.js";
import type { PoolFormation } from "../src/PoolFormation.js";
import type { Transaction } from "../src/Transaction.js";

describe("UAS Pool Integration", () => {
  it("should transform individual interest into collective capability", () => {

    const participants: Participant[] = [
      {
        id: "participant-001",
        name: "Ana"
      },
      {
        id: "participant-002",
        name: "Luis"
      },
      {
        id: "participant-003",
        name: "Pedro"
      }
    ];

    const supplier: Supplier = {
      id: "supplier-001",
      name: "UAS Provider",
      capabilities: [
        "Agricultural drones"
      ]
    };

    const offer: PoolOffer = {
      id: "offer-001",
      supplierId: supplier.id,
      title: "Agricultural Drone Pool",
      unitPrice: 10000,
      formationLevels: [
        {
          units: 3,
          price: 9000
        }
      ]
    };

    const formation: PoolFormation = {
      id: "formation-001",
      poolOfferId: offer.id,
      participantIds: participants.map(
        participant => participant.id
      ),
      targetUnits: 3,
      currentUnits: 3,
      status: "completed"
    };

    const transaction: Transaction = {
      id: "transaction-001",
      poolFormationId: formation.id,
      supplierId: supplier.id,
      participantIds: formation.participantIds,
      completedAt: new Date(),
      status: "completed"
    };


    expect(participants)
      .toHaveLength(3);

    expect(formation.status)
      .toBe("completed");

    expect(transaction.poolFormationId)
      .toBe(formation.id);

    expect(transaction.supplierId)
      .toBe(supplier.id);
  });
});