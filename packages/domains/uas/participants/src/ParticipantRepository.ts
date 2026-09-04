/**
 * Participant Repository
 *
 * Responsibility:
 *
 *   Define persistence operations for Participant records.
 *
 * The repository is intentionally unaware of:
 *
 *   - fixtures
 *   - publication
 *   - trajectories
 *   - presentation
 *   - lifecycle rules
 */

import type { Participant } from "./Participant.js";

export interface ParticipantRepository {
  save(participant: Participant): Promise<void>;
  delete(id: string): Promise<void>;
}