/**
 * DAA UAS Pool
 * ------------------------------
 * Test: Transaction
 *
 * Validates that a completed pool
 * formation can preserve relationship
 * context.
 */

import { describe, expect, it } from "vitest";
import type { Transaction } from "../src/Transaction.js";

describe("Transaction", () => {
  it("should register a completed collective relationship", () => {
    const transaction: Transaction = {
      id: "transaction-001",
      poolFormationId: "formation-001",
      supplierId: "supplier-001",
      participantIds: [
        "participant-001",
        "participant-002",
        "participant-003"
      ],
      completedAt: new Date(),
      status: "completed"
    };

    expect(transaction.poolFormationId)
      .toBe("formation-001");

    expect(transaction.supplierId)
      .toBe("supplier-001");

    expect(transaction.participantIds)
      .toHaveLength(3);

    expect(transaction.status)
      .toBe("completed");
  });

  it("should preserve relationship context after completion", () => {
    const transaction: Transaction = {
      id: "transaction-002",
      poolFormationId: "formation-002",
      supplierId: "supplier-002",
      participantIds: [
        "participant-004"
      ],
      completedAt: new Date(),
      status: "completed"
    };

    expect(transaction.participantIds[0])
      .toBe("participant-004");
  });
});