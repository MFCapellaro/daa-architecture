/**
 * DAA Kernel
 * ------------------------------
 * TrajectorySignal
 *
 * Represents observable signals
 * emerging from relational events.
 *
 * Signals are preserved before
 * interpretation.
 */


export type SignalType =
  | "participation"
  | "contribution"
  | "collaboration"
  | "learning"
  | "completion";


export interface TrajectorySignal {

  readonly identityId: string;

  readonly type: SignalType;

  readonly timestamp: Date;

  readonly context?: string;

  readonly source?: string;

}