import type { ParticipantStatus } from "../../domains/uas/participants/src/Participant.js";

export interface AuthenticatedParticipant {
  readonly participantId: string;
  readonly email: string;
  readonly status: ParticipantStatus;
}

export interface SecurityContext {
  readonly participant?: AuthenticatedParticipant;
  readonly isAuthenticated: boolean;
}
