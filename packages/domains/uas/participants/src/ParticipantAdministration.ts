/**
 * Participant Administration
 *
 * Responsibility:
 *
 *   Coordinate administrative operations
 *   on Participant records.
 *
 * The administration layer connects:
 *
 *   ParticipantList
 *   ParticipantRepository
 *
 * It is intentionally unaware of:
 *
 *   - YAML
 *   - fixtures
 *   - presentation
 *   - publication infrastructure
 *   - trajectories
 */

import type {
  ParticipantStatus,
} from "./Participant.js";
import type { ParticipantList } from "./ParticipantList.js";
import type { ParticipantRepository } from "./ParticipantRepository.js";

export class ParticipantAdministration {
  constructor(
    private readonly list: ParticipantList,
    private readonly repository: ParticipantRepository,
  ) {}

  async changeStatus(
    id: string,
    status: ParticipantStatus,
  ): Promise<void> {
    const participant = this.list.get(id);

    if (participant === undefined) {
      return;
    }

    this.list.changeStatus(id, status);

    await this.repository.save(participant);
  }

  async delete(id: string): Promise<void> {
    const participant = this.list.get(id);

    if (participant === undefined) {
      return;
    }

    this.list.delete(id);

    await this.repository.delete(id);
  }
}