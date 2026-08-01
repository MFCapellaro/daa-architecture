/**
 * DAA UAS Pool
 * ------------------------------
 * Test: PoolFormation
 *
 * Validates that individual interests
 * can become a collective formation.
 */

import { describe, expect, it } from "vitest";
import type { PoolFormation } from "../src/PoolFormation.js";

describe("PoolFormation", () => {
  it("should represent an initial collective formation", () => {
    const formation: PoolFormation = {
      id: "formation-001",
      poolOfferId: "offer-001",
      participantIds: [
        "participant-001",
        "participant-002",
        "participant-003"
      ],
      targetUnits: 3,
      currentUnits: 3,
      status: "completed"
    };

    expect(formation.participantIds).toHaveLength(3);
    expect(formation.currentUnits).toBe(3);
    expect(formation.status).toBe("completed");
  });

  it("should represent a formation in progress", () => {
    const formation: PoolFormation = {
      id: "formation-002",
      poolOfferId: "offer-002",
      participantIds: [
        "participant-001",
        "participant-002"
      ],
      targetUnits: 6,
      currentUnits: 2,
      status: "forming"
    };

    expect(formation.currentUnits).toBeLessThan(
      formation.targetUnits
    );

    expect(formation.status).toBe("forming");
  });
});