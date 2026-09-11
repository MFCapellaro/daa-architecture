export type ParticipantActorRole =
  | "representative"
  | "dealer"
  | "operator"
  | "service"
  | "member"
  | "contact"
  | "other";

export type ParticipantActorRelationStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "archived";

export interface ParticipantActorRelation {
  id: string;
  participantId: string;
  actorId: string;
  roles: ParticipantActorRole[];
  status: ParticipantActorRelationStatus;
  integrationId?: string;
  joinedAt: Date;
  endedAt?: Date;
}