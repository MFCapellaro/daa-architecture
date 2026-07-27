/**
 * DAA Kernel
 * ------------------------------
 * TrajectoryIdentity
 *
 * Represents the identity
 * whose transformations are
 * preserved through time.
 */


export interface TrajectoryIdentity {

  readonly id: string;

  readonly origin?: string;

  readonly roles: readonly string[];

  readonly interests: readonly string[];

  readonly startedAt: Date;

}