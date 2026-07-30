/**
 * DAA Kernel
 * ------------------------------
 * IdentityGuardian
 *
 * Observes identity coherence.
 */

import type { Guardian } from "./Guardian.js";
import type { KernelConcept } from "../KernelConcept.js";


export const IdentityGuardian = {

  create(): Guardian<KernelConcept> {

    return {

      name: "Identity Guardian",

      observe(
        identity: KernelConcept
      ): boolean {

        return (
          identity.definition.length > 0
        );

      }

    };

  }

} as const;