/**
 * DAA Kernel
 * --------------------------------
 * KernelLaw
 *
 * A law defines an invariant pattern
 * derived from relationships between
 * concepts.
 *
 * Laws preserve coherence across
 * system evolution.
 */

import type { KernelRelationship } from "./KernelRelationship.js";

export interface KernelLaw {
  readonly id: string;
  readonly name: string;
  readonly definition: string;
  readonly relationships: readonly KernelRelationship[];
}