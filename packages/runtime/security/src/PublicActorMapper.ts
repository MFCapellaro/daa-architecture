import type { ActorProfile } from "../../../domains/uas/ecosystem/src/ActorProfile.js";
import type { PublicActorDTO } from "../../../security/src/ActorSecurity.js";

export class PublicActorMapper {
  static toPublicActorDTO(profile: ActorProfile): PublicActorDTO {
    return {
      id: profile.id,
      actorId: profile.actorId,
      description: profile.description,
      capabilities: profile.capabilities ? [...profile.capabilities] : undefined,
      services: profile.services ? [...profile.services] : undefined,
      regions: profile.regions ? [...profile.regions] : undefined,
      updatedAt: profile.updatedAt,
    };
  }
}
