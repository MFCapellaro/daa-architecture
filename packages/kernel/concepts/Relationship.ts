/**
 * DAA Kernel
 * ------------------------------
 * Concept: Relationship
 *
 * Relationships connect concepts.
 *
 * The organization of relationships
 * gives rise to structure.
 */

import type { KernelConcept } from "../KernelConcept.js";

export const Relationship: KernelConcept = {
  id: "relationship",

  name: "Relationship",

  definition:
    "A semantic connection between concepts."
} as const;