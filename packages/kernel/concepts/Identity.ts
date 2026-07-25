/**
 * DAA Kernel
 * ------------------------------
 * Concept: Identity
 *
 * Identity defines what remains
 * coherent across change.
 *
 * It provides continuity while
 * allowing system evolution.
 */

import type { KernelConcept } from "../KernelConcept.js";

export const Identity: KernelConcept = {
  id: "identity",

  name: "Identity",

  definition:
    "The coherence that remains across change."
} as const;