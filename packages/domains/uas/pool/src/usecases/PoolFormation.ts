/**
 * DAA UAS Pool
 * --------------------------------
 * Behavior
 *
 * PoolFormation
 *
 * Collective organization emerges
 * when individual interests become
 * sufficiently coherent to define
 * a shared opportunity.
 *
 * This behavior transforms individual
 * relationships into a new collective
 * identity while preserving the identity
 * of every participant.
 *
 * The Runtime executes this behavior.
 */

import type { Participant } from "../Participant.js";
import type { PoolFormationIdentity } from "../PoolFormationIdentity.js";
import type { PoolOffer } from "../PoolOffer.js";

export interface PoolFormationInput {
  readonly offer: PoolOffer;
  readonly participants: readonly Participant[];
}

export interface PoolFormationOutput {
  readonly formation: PoolFormationIdentity;
}

export const PoolFormation = {

  execute(
    input: PoolFormationInput
  ): PoolFormationOutput {

    const targetUnits =
      input.offer.formationLevels[0].units;

    const currentUnits =
      input.participants.length;

    const formation: PoolFormationIdentity = {
      id: crypto.randomUUID(),

      poolOfferId: input.offer.id,

      participantIds: input.participants.map(
        participant => participant.id
      ),

      targetUnits,

      currentUnits,

      status:
        currentUnits >= targetUnits
          ? "completed"
          : "forming"
    };

    return {
      formation
    };
  }

};

 /**
 * The result of this behavior is a
 * PoolFormationIdentity.
 */