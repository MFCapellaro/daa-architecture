/**
 * DAA Kernel
 * --------------------------------
 * KernelRelationship
 *
 * A semantic relationship between two Kernel Concepts.
 *
 * Relationships are the fundamental units
 * of structure within the DAA Kernel.
 */

import type { KernelConcept } from "./KernelConcept.js";
import type { Verb } from "./Verb.js";

export interface KernelRelationship {
  readonly id: string;
  readonly source: KernelConcept;
  readonly verb: Verb;
  readonly target: KernelConcept;
}

export const KernelRelationship = {
  of(
    source: KernelConcept,
    verb: Verb,
    target: KernelConcept
  ): KernelRelationship {
    return {
      id: `${source.id}:${verb}:${target.id}`,
      source,
      verb,
      target
    };
  }
} as const;