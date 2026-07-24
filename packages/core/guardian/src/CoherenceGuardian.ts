import type { Possibility } from "../../src/triads/Possibility.js"
import type { Coherence } from "../../src/triads/Coherence.js"

/**
 * The Coherence Guardian preserves the orientation
 * that gives meaning to the evolutionary path.
 */
export interface CoherenceGuardian {
  align(
    possibility: Possibility,
    coherence: Coherence
  ): boolean
}