/**
 * DAA Kernel
 * ------------------------------
 * AdaptiveAction
 *
 * Represents a coherent action
 * derived from a coherence
 * assessment.
 */

import type {
  CoherenceAssessment
} from "./CoherenceAssessment.js";


export interface AdaptiveAction {

  /**
   * Assessment that originated
   * this action.
   */
  readonly assessment:
    CoherenceAssessment;

  /**
   * Human-readable description
   * of the adaptive response.
   */
  readonly description:
    string;

}


export const AdaptiveAction = {

  of(
    assessment: CoherenceAssessment,
    description: string
  ): AdaptiveAction {

    return {

      assessment,
      description

    };

  }

} as const;