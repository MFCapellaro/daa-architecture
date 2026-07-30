/**
 * Represents a coherent adjustment
 * of an existing relationship.
 */

import type { KernelRelationship } from "../KernelRelationship.js";

export interface RelationshipAdjustment {

  readonly previous: KernelRelationship;

  readonly current: KernelRelationship;

}