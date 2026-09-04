/**
 * Participant Action Recorder
 *
 * Responsibility:
 *
 *   Record an action performed by a Participant.
 *
 * The recorder connects:
 *
 *   Participant identity
 *        ↓
 *      Action
 *        ↓
 *   ActionRepository
 *
 * It does not know:
 *
 *   - Entry Pages
 *   - publication
 *   - review
 *   - trajectories
 *   - presentation
 */

import type {
  Action,
  ActionTargetType,
  ActionType,
} from "./Action.js";
import type { ActionRepository } from "./ActionRepository.js";

export interface ParticipantActionInput {
  type: ActionType;
  targetType: ActionTargetType;
  targetId: string;
}

export class ParticipantActionRecorder {
  constructor(
    private readonly repository: ActionRepository,
    private readonly createId: () => string = () =>
      crypto.randomUUID(),
    private readonly now: () => Date = () =>
      new Date(),
  ) {}

  async record(
    participantId: string,
    input: ParticipantActionInput,
  ): Promise<Action> {
    const action: Action = {
      id: this.createId(),
      participantId,
      type: input.type,
      targetType: input.targetType,
      targetId: input.targetId,
      occurredAt: this.now(),
    };

    await this.repository.save(action);

    return action;
  }
}