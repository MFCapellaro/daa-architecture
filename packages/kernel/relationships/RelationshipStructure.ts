/**
 * DAA Kernel
 * ------------------------------
 * Relationship:
 *
 * Relationships create Structure.
 *
 * The organization of relationships
 * gives rise to system structure.
 */

import { Relationship } from "../concepts/Relationship.js";
import { Structure } from "../concepts/Structure.js";

import { KernelRelationship } from "../KernelRelationship.js";
import { Verbs } from "../Verb.js";

export const RelationshipStructure = KernelRelationship.of(
  Relationship,
  Verbs.Creates,
  Structure
);