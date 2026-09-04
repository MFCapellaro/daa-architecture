/**
 * DAA UAS Pool
 * ------------------------------
 * Test: Participant
 *
 * Validates that a participant
 * can exist with minimal identity.
 */

import { describe, expect, it } from "vitest";
import type { Participant } from "../src/Participant.js";

describe("Participant", () => {
  it("should define a participant with minimal identity", () => {
    const participant: Participant = {
      id: "participant-001",
      name: "María"
    };

    expect(participant.id).toBe("participant-001");
    expect(participant.name).toBe("María");
  });

  it("should allow progressive identity expansion", () => {
    const participant: Participant = {
      id: "participant-002",
      name: "Carlos",
      location: "Buenos Aires",
      interests: ["UAS"]
    };

    expect(participant.location).toBe("Buenos Aires");
    expect(participant.interests).toContain("UAS");
  });
});