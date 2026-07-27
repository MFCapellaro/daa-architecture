/**
 * DAA Kernel
 * ------------------------------
 * TrajectoryPattern
 *
 * Represents observable regularities
 * emerging from accumulated trajectory
 * signals over time.
 *
 * Patterns preserve repetition and
 * coherence before interpretation.
 */


import type {
  SignalType
} from "./TrajectorySignal.js";


export interface TrajectoryPattern {

  readonly identityId: string;

  readonly signalType: SignalType;

  readonly occurrences: number;

  readonly firstObservedAt: Date;

  readonly lastObservedAt: Date;

}