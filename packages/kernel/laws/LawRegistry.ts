/**
 * DAA Kernel
 * ------------------------------
 * LawRegistry
 *
 * Registry of fundamental laws
 * that preserve system coherence.
 */

import type { KernelLaw } from "../KernelLaw.js";

export interface LawRegistry {
  readonly laws: readonly KernelLaw[];
}

export const LawRegistry = {
  create(
    laws: readonly KernelLaw[]
  ): LawRegistry {
    return {
      laws
    };
  }
} as const;