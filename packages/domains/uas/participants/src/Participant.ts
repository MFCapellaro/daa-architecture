/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * A Participant is an Actor that has
 * voluntarily established a relationship
 * with DAA.
 *
 * Participation enables contribution,
 * relationships and trajectories within
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
   * Current participation status.
   */
  status: ParticipantStatus;

  /**
   * Date on which participation began.
   */
  joinedAt: Date;
}
