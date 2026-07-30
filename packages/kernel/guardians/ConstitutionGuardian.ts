/**
 * DAA Kernel
 * ------------------------------
 * ConstitutionGuardian
 *
 * Observes constitutional law coherence.
 */

import type { Guardian } from "./Guardian.js";
import type { KernelLaw } from "../KernelLaw.js";


export const ConstitutionGuardian: Guardian<KernelLaw> = {

  name: "Constitution Guardian",

  observe(
    law: KernelLaw
  ): boolean {

    return (
      law.definition.length > 0 &&
      law.relationships.length > 0
    );

  }

};