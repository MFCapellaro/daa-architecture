import type { ActorProfile } from "./ActorProfile.js";
import type { PublicActorDTO } from "../../../../security/src/ActorSecurity.js";
import type { SecurityContext } from "../../../../security/src/SecurityContext.js";
import { PublicActorMapper } from "../../../../runtime/security/src/PublicActorMapper.js";
import type { AuthGuard } from "../../../../runtime/security/src/AuthGuard.js";

export interface ActorProfileRepository {
  findByActorId(actorId: string): Promise<ActorProfile | null>;
}

export class ActorProfileService {
  constructor(
    private readonly repository: ActorProfileRepository,
    private readonly authGuard: AuthGuard
  ) {}

  async getPublicProfile(actorId: string): Promise<PublicActorDTO> {
    const profile = await this.repository.findByActorId(actorId);
    if (!profile) {
      throw new Error(`Profile not found for actor ${actorId}`);
    }

    return PublicActorMapper.toPublicActorDTO(profile);
  }

  async getFullProfile(actorId: string, context: SecurityContext): Promise<ActorProfile> {
    this.authGuard.assertAuthenticated(context);

    const profile = await this.repository.findByActorId(actorId);
    if (!profile) {
      throw new Error(`Profile not found for actor ${actorId}`);
    }

    return profile;
  }
}
