/**
 * Participant List
 *
 * Responsibility:
 *
 *   Provide an administrative collection
 *   of Participant domain objects.
 *
 * The list is intentionally unaware of:
 *
 *   - fixtures
 *   - YAML persistence
 *   - publication infrastructure
 *   - trajectories
 *   - presentation
 */

import type {
  Participant,
  ParticipantStatus,
} from "./Participant.js";

export interface ParticipantFilter {
  status?: ParticipantStatus;
  search?: string;
  joinedFrom?: Date;
  joinedTo?: Date;
}

export class ParticipantList {
private readonly participants: Participant[];

constructor(participants: Participant[]) {
  this.participants = [...participants];
}

  all(): Participant[] {
    return [...this.participants];
  }

  get size(): number {
    return this.participants.length;
  }

  get(id: string): Participant | undefined {
    return this.participants.find(
      (participant) => participant.id === id,
    );
  }

  changeStatus(
  id: string,
  status: ParticipantStatus,
): void {
  const participant = this.get(id);

  if (participant === undefined) {
    return;
  }

  participant.status = status;
}

delete(id: string): void {
  const index = this.participants.findIndex(
    (participant) => participant.id === id,
  );

  if (index === -1) {
    return;
  }

  this.participants.splice(index, 1);
}

  filter(criteria: ParticipantFilter): Participant[] {
    return this.participants.filter((participant) => {
      if (
        criteria.status !== undefined &&
        participant.status !== criteria.status
      ) {
        return false;
      }

      if (criteria.search !== undefined) {
        const search = criteria.search.toLowerCase();

        if (
          !participant.id.toLowerCase().includes(search) &&
          !participant.actorId.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      if (
        criteria.joinedFrom !== undefined &&
        participant.joinedAt < criteria.joinedFrom
      ) {
        return false;
      }

      if (
        criteria.joinedTo !== undefined &&
        participant.joinedAt > criteria.joinedTo
      ) {
        return false;
      }

      return true;
    });
  }
}