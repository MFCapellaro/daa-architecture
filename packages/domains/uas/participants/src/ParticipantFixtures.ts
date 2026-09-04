/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * Development fixtures for Participants.
 *
 * These records are simulated data used to
 * exercise Progressive Entry and Participant
 * information status.
 *
 * They are not part of the ecosystem corpus.
 */

import type { Participant } from "./Participant.js";
import type { ProgressiveEntry } from "./ProgressiveEntry.js";

export interface ParticipantFixture {
  participant: Participant;
  progressiveEntry: ProgressiveEntry;
}

export const participantFixtures: ParticipantFixture[] = [
  {
    participant: {
      id: "participant-001",
      actorId: "actor-001",
      status: "active",
      joinedAt: new Date("2026-08-01"),
    },
    progressiveEntry: {
      participantId: "participant-001",
      identity: true,
      profile: false,
      capabilities: false,
      interests: false,
    },
  },

  {
    participant: {
      id: "participant-002",
      actorId: "actor-002",
      status: "active",
      joinedAt: new Date("2026-08-05"),
    },
    progressiveEntry: {
      participantId: "participant-002",
      identity: true,
      profile: true,
      capabilities: false,
      interests: false,
    },
  },

  {
    participant: {
      id: "participant-003",
      actorId: "actor-003",
      status: "active",
      joinedAt: new Date("2026-07-20"),
    },
    progressiveEntry: {
      participantId: "participant-003",
      identity: true,
      profile: true,
      capabilities: true,
      interests: false,
    },
  },

  {
    participant: {
      id: "participant-004",
      actorId: "actor-004",
      status: "active",
      joinedAt: new Date("2026-07-10"),
    },
    progressiveEntry: {
      participantId: "participant-004",
      identity: true,
      profile: false,
      capabilities: true,
      interests: true,
    },
  },

  {
    participant: {
      id: "participant-005",
      actorId: "actor-005",
      status: "active",
      joinedAt: new Date("2026-06-15"),
    },
    progressiveEntry: {
      participantId: "participant-005",
      identity: true,
      profile: true,
      capabilities: true,
      interests: true,
    },
  },

  {
    participant: {
      id: "participant-006",
      actorId: "actor-006",
      status: "inactive",
      joinedAt: new Date("2026-05-01"),
    },
    progressiveEntry: {
      participantId: "participant-006",
      identity: true,
      profile: true,
      capabilities: true,
      interests: true,
    },
  },
];