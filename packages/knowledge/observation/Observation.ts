/**
 * DAA Knowledge
 * ------------------------------
 * Observation
 *
 * Represents an observed signal
 * emerging from an experience.
 *
 * Observation preserves relevant
 * information before interpretation.
 */

import type { Experience } from "../experience/Experience.js";

export interface Observation {

  readonly id: string;

  readonly source: Experience;

  readonly signal: string;

}