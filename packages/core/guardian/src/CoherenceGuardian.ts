/**
 * DAA Core
 * ------------------------------
 * CoherenceGuardian
 *
 * Coordinates coherent evolution by
 * evaluating whether new possibilities
 * remain aligned with system coherence.
 */

import type { Possibility } from "../../src/triads/Possibility.js";
import type { Coherence } from "../../src/triads/Coherence.js";

export interface CoherenceGuardian {

  /**
   * Evaluates whether a possibility
   * preserves coherent operation.
   */
  align(

    possibility: Possibility,

    coherence: Coherence

  ): boolean;

}