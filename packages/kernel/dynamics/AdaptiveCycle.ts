/**
 * DAA Kernel
 * ------------------------------
 * AdaptiveCycle
 *
 * Coordinates the dynamic flow
 * from relationship trajectory
 * to adaptive action.
 */

import type {
  RelationshipTrajectory
} from "./RelationshipTrajectory.js";

import type {
  CoherenceEvaluator
} from "./CoherenceEvaluator.js";

import {
  AdaptiveAction
} from "./AdaptiveAction.js";


export interface AdaptiveCycle {

  /**
   * Produces an adaptive action
   * from a relationship trajectory.
   */
  process(
    trajectory: RelationshipTrajectory
  ): AdaptiveAction;

}


export const AdaptiveCycle = {

  create(
    evaluator: CoherenceEvaluator
  ): AdaptiveCycle {

    return {

      process(
        trajectory: RelationshipTrajectory
      ): AdaptiveAction {

        const assessment =
          evaluator.evaluate(
            trajectory
          );

        return AdaptiveAction.of(

          assessment,

          assessment.coherent
            ? "Maintain coherent trajectory."
            : "Restore coherent trajectory."

        );

      }

    };

  }

} as const;