/**
 * DAA Kernel
 * ------------------------------
 * CoherenceAssessment
 *
 * Represents the result of evaluating
 * the coherence of a relationship
 * trajectory.
 */

export interface CoherenceAssessment {

  /**
   * Indicates whether the evaluated
   * trajectory preserves coherence.
   */
  readonly coherent: boolean;

  /**
   * Normalized coherence score.
   * Range: 0.0 – 1.0
   */
  readonly score: number;

  /**
   * Human-readable observations that
   * explain the assessment.
   */
  readonly observations:
    readonly string[];

}

export const CoherenceAssessment = {

  of(
    coherent: boolean,
    score: number,
    observations: readonly string[] = []
  ): CoherenceAssessment {

    return {
      coherent,
      score,
      observations
    };

  }

} as const;