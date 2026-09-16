import type { SecurityContext } from "../../../security/src/SecurityContext.js";
import type { AuthGuard } from "./AuthGuard.js";
import type { ParticipantActorGuard } from "./ParticipantActorGuard.js";
import type { DnaAgreementGuard } from "./DnaAgreementGuard.js";
import type { ActorSecurityContext } from "@security/ActorSecurity.js";

export class DealerPoolAccessGuard {
  constructor(
    private readonly authGuard: AuthGuard,
    private readonly participantActorGuard: ParticipantActorGuard,
    private readonly dnaAgreementGuard: DnaAgreementGuard
  ) {}

  async authorizePoolEdit(context: SecurityContext, actorId: string): Promise<void> {
    this.authGuard.assertAuthenticated(context);

    const canManage = await this.participantActorGuard.canManageActor(context, actorId);
    if (!canManage) {
      throw new Error(`Forbidden: Participant does not manage actor ${actorId}`);
    }

    const hasDna = await this.dnaAgreementGuard.hasActiveAgreement(actorId);
    if (!hasDna) {
      throw new Error(`Forbidden: Actor ${actorId} does not have an active DNA Agreement`);
    }
  }

  canCreate(context: ActorSecurityContext): boolean {
    return context.roles.includes("DEALER");
  }

  canEdit(context: ActorSecurityContext, pool: unknown): boolean {
    return context.roles.includes("DEALER");
  }

  canRead(context: ActorSecurityContext, pool: unknown): boolean {
    return true;
  }
}