/**
 * DAA Runtime
 * ------------------------------
 * Runtime Signal
 *
 * Signals reveal contextual conditions
 * that support coherent navigation.
 *
 * Signals do not determine behavior.
 *
 * They make relevant conditions observable
 * during runtime.
 */

export interface RuntimeSignal {

  /**
   * Unique signal identifier.
   */
  readonly id: string;

  /**
   * Signal name.
   */
  readonly name: string;

  /**
   * Human-readable description.
   */
  readonly description: string;

}