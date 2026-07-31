/**
 * DAA LUX
 * ------------------------------
 * Transmitance
 *
 * Transmitance represents the architectural
 * property through which condensed coherence
 * traverses contexts while preserving identity.
 */

import type {
  Recognition
} from "./Recognition.js";

export interface Transmitance {

  /**
   * Recognition emerging
   * from transmitted coherence.
   */
  readonly recognition: Recognition;

  /**
   * Source context.
   */
  readonly sourceContext: string;

  /**
   * Target context.
   */
  readonly targetContext: string;

}


export const Transmitance = {

  of(
    recognition: Recognition,
    sourceContext: string,
    targetContext: string
  ): Transmitance {

    return {
      recognition,
      sourceContext,
      targetContext
    };

  }

};