import type { SecurityContext } from "./SecurityContext.js";
import type { ActorProfile } from "../../domains/uas/ecosystem/src/ActorProfile.js";
import type { ParticipantActorRole, ParticipantActorRelationStatus } from "../../domains/uas/participants/src/ParticipantActorRelation.js";

export interface PublicActorDTO {
  readonly id: string;
  readonly name: string;
  readonly actorId: string;
  readonly description?: string;
  readonly capabilities?: readonly string[];
  readonly services?: readonly string[];
  readonly regions?: readonly string[];
  readonly updatedAt: Date;
}

export interface ParticipantActorMapping {
  readonly participantId: string;
  readonly actorId: string;
  readonly roles: readonly ParticipantActorRole[];
  readonly status: ParticipantActorRelationStatus;
}

export interface DnaAgreementRequirement {
  readonly actorId: string;
  readonly hasActiveAgreement: boolean;
}

export interface ActorSecurityContext extends SecurityContext {
  actorId: string;
  roles: string[];
  permissions?: string[];
}