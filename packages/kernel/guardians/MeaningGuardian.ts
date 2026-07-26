/**
 * DAA Kernel
 * ------------------------------
 * MeaningGuardian
 *
 * Preserves semantic foundations
 * required for coherent structures.
 */

import type { Guardian } from "./Guardian.js";
import type { KernelConcept } from "../KernelConcept.js";


export interface MeaningGuardian
  extends Guardian<KernelConcept> {
}


export const MeaningGuardian = {
  create(): MeaningGuardian {

    return {

      name: "Meaning Guardian",

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