/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Trajectory
 *
 * A Trajectory represents the coherent
 * evolution of a Participant through time.
 *
 * Identity is preserved.
 * Relationships evolve.
 * Evolution emerges.
 */

export type TrajectoryStatus =
  | "emerging"
  | "active"
  | "aligned"
  | "expanding"
  | "renewed"
  | "archived";

export interface Trajectory {
  /**
   * Trajectory identifier.
   */
  id: string;

  /**
   * Related Participant.
   */
  participantId: string;

  /**
   * Current trajectory purpose.
   */
  purpose: string;

  /**
   * Stable evolutionary reference.
   */
  horizon?: string;

  /**
   * Current sense of orientation.
   */
  orientation?: string;

  /**
   * Current expression of the trajectory.
   */
  course?: string;

  /**
   * Current lifecycle state.
   */
  status: TrajectoryStatus;

  /**
   * Creation timestamp.
   */
  createdAt: Date;

  /**
   * Last evolution update.
   */
  updatedAt: Date;
}