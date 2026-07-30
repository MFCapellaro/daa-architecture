/**
 * DAA Kernel
 * ------------------------------
 * CoherenceEvaluator
 *
 * Evaluates whether a relationship
 * trajectory preserves coherent
 * continuity.
 */

import type {
  RelationshipTrajectory
} from "./RelationshipTrajectory.js";

import {
  CoherenceAssessment
} from "./CoherenceAssessment.js";


export interface CoherenceEvaluator {

  /**
   * Evaluates the coherence of
   * a relationship trajectory.
   */
  evaluate(
    trajectory: RelationshipTrajectory
  ): CoherenceAssessment;

}


export const CoherenceEvaluator = {

  create(): CoherenceEvaluator {

    return {

      evaluate(
        trajectory: RelationshipTrajectory
      ): CoherenceAssessment {

        const coherent =
          trajectory.adjustments.length > 0;

        return CoherenceAssessment.of(

          coherent,

          coherent
            ? 1.0
            : 0.0,

          coherent
            ? [
                "Trajectory preserves coherent continuity."
              ]
            : [
                "Trajectory contains no relationship adjustments."
              ]

        );

      }

    };

  }

} as const;