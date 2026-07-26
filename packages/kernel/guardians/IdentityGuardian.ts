/**
 * DAA Kernel
 * ------------------------------
 * IdentityGuardian
 *
 * Preserves system identity
 * during transformation.
 */

import type { Guardian } from "./Guardian.js";
import type { KernelConcept } from "../KernelConcept.js";


export interface IdentityGuardian
  extends Guardian<KernelConcept> {
}
/**
 * Creates an Identity Guardian.
 *
 * A valid identity requires
 * a defined semantic foundation.
 */

export const IdentityGuardian = {
  create(): IdentityGuardian {

    return {

      name: "Identity Guardian",

      preserve(
        concept: KernelConcept
      ): boolean {

        return (
          concept.definition.trim().length > 0
        );

      }

    };
  }
} as const;