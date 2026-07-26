/**
 * DAA Kernel
 * ------------------------------
 * KernelConstitution
 *
 * Defines the fundamental laws
 * that preserve the identity
 * and coherence of the Kernel.
 */

import type { KernelLaw } from "./KernelLaw.js";

export interface KernelConstitution {
  readonly name: string;
  readonly laws: readonly KernelLaw[];
}

export const KernelConstitution = {
  define(
    laws: readonly KernelLaw[]
  ): KernelConstitution {
    return {
      name: "DAA Kernel Constitution",
      laws
    };
  }
} as const;