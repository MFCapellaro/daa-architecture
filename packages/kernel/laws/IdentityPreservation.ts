/**
 * DAA Kernel
 * ------------------------------
 * IdentityPreservation Law
 *
 * Preserves system identity through
 * coherent relationships during change.
 */

import type { KernelLaw } from "../KernelLaw.js";
import type { KernelConcept } from "../KernelConcept.js";
import { KernelRelationship } from "../KernelRelationship.js";
import { Verbs } from "../Verb.js";

export const IdentityPreservation = (
  identity: KernelConcept,
  coherence: KernelConcept
): KernelLaw => {

  return {
    id: "identity-preservation",

    name: "Identity Preservation",

    definition:
      "A system may evolve while preserving the relationships that maintain its identity.",

    relationships: [
      KernelRelationship.of(
        identity,
        Verbs.Preserves,
        coherence
      )
    ]
  };
};