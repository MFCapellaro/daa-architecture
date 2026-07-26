/**
 * DAA Kernel
 * ------------------------------
 * RelationshipGuardian
 *
 * Preserves semantic connections
 * between kernel concepts.
 */

import type { Guardian } from "./Guardian.js";
import type { KernelRelationship } from "../KernelRelationship.js";


export interface RelationshipGuardian
  extends Guardian<KernelRelationship> {
}


export const RelationshipGuardian = {
  create(): RelationshipGuardian {

    return {

      name: "Relationship Guardian",

      preserve(
        relationship: KernelRelationship
      ): boolean {

        return (
          relationship.source.definition.trim().length > 0 &&
          relationship.target.definition.trim().length > 0 &&
          relationship.verb.length > 0
        );

      }

    };
  }
} as const;