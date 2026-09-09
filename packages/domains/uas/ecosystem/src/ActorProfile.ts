/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * ActorProfile represents the current
 * expression of an Actor within the ecosystem.
 *
 * Identity remains stable.
 * Profile evolves through relationships,
 * capabilities, services and context changes.
 */

export interface ActorProfile {
  /**
   * Profile identifier.
   */
  id: string;

  /**
   * Related Actor identity.
   */
  actorId: string;

  /**
   * Current ecosystem description.
   */
  description?: string;

  /**
 * Current observable capabilities.
 *
 * Capabilities describe the Actor's
 * present expression within the ecosystem.
 *
 * They may evolve over time.
 */
  capabilities?: string[];

  /**
 * Services currently offered
 * by the Actor.
 */
  services?: string[];

  /**
   * Geographic operational context.
   */
  regions?: string[];

  /**
   * Contact channels.
   */
  contact?: {
    website?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
  };

  /**
   * Profile update timestamp.
   */
  updatedAt: Date;
}