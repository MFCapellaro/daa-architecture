/**
 * DAA Runtime
 * ------------------------------
 * Runtime Observation
 *
 * Observations recognize contextual signals
 * during runtime.
 *
 * Observation enables coherent assessment
 * without determining system behavior.
 */

export interface RuntimeObservation {

  /**
   * Unique observation identifier.
   */
  readonly id: string;

  /**
   * Observation name.
   */
  readonly name: string;

  /**
   * Human-readable description.
   */
  readonly description: string;

}