/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * A Participant is an Actor that has
 * voluntarily established a relationship
 * with DAA.
 *
 * Participation enables trajectories,
 * relationships and contribution within
 * the system.
 */

export type ParticipantStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "archived";

export interface Participant {
  /**
   * Participant identifier.
   */
  id: string;

  /**
   * Related ecosystem Actor.
   */
  actorId: string;

  /**
   * Related IntegrationRecord.
   */
  integrationId: string;

  /**
   * Current participation status.
   */
  status: ParticipantStatus;

  /**
   * Participation starting date.
   */
  joinedAt: Date;

  /**
   * Last activity timestamp.
   */
  lastActivityAt?: Date;

  /**
   * Optional participation notes.
   */
  notes?: string;
}