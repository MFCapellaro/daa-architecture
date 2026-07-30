/**
 * DAA Kernel
 * ------------------------------
 * Guardian
 *
 * Generic contract for coherence
 * observation mechanisms.
 *
 * Guardians observe system elements
 * and provide coherence information.
 */

export interface Guardian<T> {

  readonly name: string;

  observe(
    subject: T
  ): boolean;

}