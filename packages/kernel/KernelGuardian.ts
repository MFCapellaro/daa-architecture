/**
 * DAA Kernel
 * --------------------------------
 * KernelGuardian
 *
 * A guardian observes and preserves
 * coherence between system identity
 * and governing laws.
 *
 * Guardians protect coherence across
 * system evolution.
 */

import type { KernelConcept } from "./KernelConcept.js";
import type { KernelLaw } from "./KernelLaw.js";

export interface KernelGuardian {
  readonly id: string;
  readonly name: string;
  readonly responsibility: string;
  readonly observes: readonly KernelLaw[];
  readonly protects: readonly KernelConcept[];
}