/**
 * DAA Core
 * ------------------------------
 * PrimaryTriad
 *
 * Defines the minimum generative
 * coordination structure of DAA.
 */

import type { Sense } from "./Sense.js";
import type { Coherence } from "./Coherence.js";
import type { Possibility } from "./Possibility.js";

export interface PrimaryTriad {

  readonly sense: Sense;

  readonly coherence: Coherence;

  readonly possibility: Possibility;

}