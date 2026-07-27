/**
 * DAA Kernel
 * ------------------------------
 * Trajectory
 *
 * Represents the temporal continuity
 * of identity transformations.
 */

export interface TrajectoryEvent {

  readonly timestamp: Date;

  readonly type: string;

  readonly context?: string;

  readonly description?: string;

  readonly outcome?: string;

}


export interface IdentityTrajectory {

  readonly identityId: string;

  readonly events: readonly TrajectoryEvent[];

}