/**
 * DAA Kernel
 * ------------------------------
 * ConstitutionGuardian
 *
 * Preserves the foundational laws
 * that define kernel coherence.
 */

import type { Guardian } from "./Guardian.js";
import type { KernelLaw } from "../KernelLaw.js";


export interface ConstitutionGuardian
  extends Guardian<KernelLaw> {
}


export const ConstitutionGuardian = {
  create(): ConstitutionGuardian {

    return {

      name: "Constitution Guardian",

      preserve(
        law: KernelLaw
      ): boolean {

        return (
          law.id.length > 0 &&
          law.name.length > 0 &&
          law.definition.length > 0 &&
          law.relationships.length > 0
        );

      }

    };
  }
} as const;