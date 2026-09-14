import type { SecurityContext } from "../../../security/src/SecurityContext.js";
import type { ParticipantActorMapping } from "../../../security/src/ActorSecurity.js";

export interface ParticipantActorRelationRepository {
  findRelation(participantId: string, actorId: string): Promise<ParticipantActorMapping | null>;
}

export class ParticipantActorGuard {
  constructor(private readonly relationRepo: ParticipantActorRelationRepository) {}

  async canManageActor(context: SecurityContext, actorId: string): Promise<boolean> {
    if (!context.isAuthenticated || !context.participant) {
      return false;
    }

    const relation = await this.relationRepo.findRelation(
      context.participant.participantId,
      actorId
    );

    return relation !== null && relation.status === "active";
  }
}
