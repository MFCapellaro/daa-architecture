/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * ActorProfile represents the current
 * expression of an Actor within the ecosystem.
 *
 * Identity remains stable.
 * Profile evolves through relationships
 * and context changes.
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
   * Current capabilities.
   */
  capabilities?: string[];

  /**
   * Services currently offered.
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
  };

  /**
   * Profile update timestamp.
   */
  updatedAt: Date;
}