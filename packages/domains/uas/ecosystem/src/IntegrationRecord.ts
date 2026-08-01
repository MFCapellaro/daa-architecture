/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * IntegrationRecord represents the voluntary
 * relationship established between an Actor
 * and DAA.
 *
 * Integration is the transition point between
 * ecosystem recognition and system participation.
 */

export type IntegrationStatus =
  | "initiated"
  | "invited"
  | "reviewing"
  | "accepted"
  | "declined"
  | "revoked";

export interface IntegrationRecord {
  /**
   * Integration identifier.
   */
  id: string;

  /**
   * Related ecosystem Actor.
   */
  actorId: string;

  /**
   * Current integration state.
   */
  status: IntegrationStatus;

  /**
   * Reference to accepted DAA DNA version.
   */
  dnaVersion?: string;

  /**
   * Date when integration started.
   */
  initiatedAt: Date;

  /**
   * Date of acceptance.
   */
  acceptedAt?: Date;

  /**
   * Date when relationship ended.
   */
  revokedAt?: Date;

  /**
   * Integration notes.
   */
  notes?: string;
}