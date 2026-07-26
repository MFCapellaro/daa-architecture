/**
 * DAA Kernel
 * ------------------------------
 * MeaningPrecedesRelationship Law
 *
 * A relationship can only emerge
 * between concepts that have defined meaning.
 *
 * Meaning precedes structure.
 */

import type { KernelLaw } from "../KernelLaw.js";
import type { KernelConcept } from "../KernelConcept.js";
import { KernelRelationship } from "../KernelRelationship.js";
import { Verbs } from "../Verb.js";

export const MeaningPrecedesRelationship = (
  meaning: KernelConcept,
  relationship: KernelConcept
): KernelLaw => {

  return {
    id: "meaning-precedes-relationship",

    name: "Meaning Precedes Relationship",

    definition:
      "A valid relationship can only emerge between concepts with defined meaning.",

    relationships: [
      KernelRelationship.of(
        meaning,
        Verbs.Defines,
        relationship
      )
    ]
  };
};