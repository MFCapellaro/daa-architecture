/**
 * DAA Kernel
 * ------------------------------
 * RelationshipTrajectory
 *
 * Represents the continuity of
 * coherent relationship adjustments
 * through time while preserving
 * system identity.
 */

import type { RelationshipAdjustment }
  from "./RelationshipAdjustment.js";


export interface RelationshipTrajectory {

  /**
   * Ordered coherent adjustments.
   */
  readonly adjustments:
    readonly RelationshipAdjustment[];

}


export const RelationshipTrajectory = {

  of(
    adjustments: readonly RelationshipAdjustment[]
  ): RelationshipTrajectory {

    return {
      adjustments
    };

  }

} as const;