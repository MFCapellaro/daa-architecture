/**
 * DAA LUX
 * ------------------------------
 * Propagation
 *
 * Propagation represents the architectural
 * condition through which recognized coherence
 * expands across contexts.
 */

import type {
  Transmittance
} from "./Transmittance.js";

export interface Propagation {

  /**
   * Transmitted coherent state.
   */
  readonly transmittance: Transmittance;

  /**
   * Context in which coherent
   * propagation occurs.
   */
  readonly context: string;

}


export const Propagation = {

  of(
    transmittance: Transmittance,
    context: string
  ): Propagation {

    return {
      transmittance,
      context
    };

  }

};