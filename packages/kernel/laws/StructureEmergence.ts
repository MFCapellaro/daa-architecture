/**
 * DAA Kernel
 * ------------------------------
 * Law: Structure Emergence
 *
 * Structure emerges from the
 * organization of relationships.
 */

import type { KernelLaw } from "../KernelLaw.js";

import { RelationshipStructure } from "../relationships/RelationshipStructure.js";

export const StructureEmergence: KernelLaw = {
  id: "structure-emergence",

  name: "Structure Emergence",

  definition:
    "Structure emerges from the organization of relationships.",

  relationships: [
    RelationshipStructure
  ]
};