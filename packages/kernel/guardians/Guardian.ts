/**
 * DAA Kernel
 * ------------------------------
 * Guardian
 *
 * Generic contract for coherence
 * preservation mechanisms.
 */

export interface Guardian<T> {

  readonly name: string;

  preserve(
    subject: T
  ): boolean;

}