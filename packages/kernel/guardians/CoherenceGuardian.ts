/**
 * DAA Kernel
 * ------------------------------
 * CoherenceGuardian
 *
 * Coordinates specialized guardians
 * to preserve system coherence.
 */

import type { Guardian } from "./Guardian.js";

export interface CoherenceGuardian {

  readonly name: string;

  evaluate<T>(
    subject: T,
    guardians: readonly Guardian<T>[]
  ): boolean;

}


export const CoherenceGuardian = {
  create(): CoherenceGuardian {

    return {

      name: "Coherence Guardian",

      evaluate<T>(
        subject: T,
        guardians: readonly Guardian<T>[]
      ): boolean {

        return guardians.every(
          guardian =>
            guardian.preserve(subject)
        );

      }

    };
  }
} as const;