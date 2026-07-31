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
  Transmitance
} from "./Transmitance.js";

export interface Propagation {

  /**
   * Transmitted coherent state.
   */
  readonly transmitance: Transmitance;

  /**
   * Context in which coherent
   * propagation occurs.
   */
  readonly context: string;

}


export const Propagation = {

  of(
    transmitance: Transmitance,
    context: string
  ): Propagation {

    return {
      transmitance,
      context
    };

  }

};