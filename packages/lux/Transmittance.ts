/**
 * DAA LUX
 * ------------------------------
 * Transmittance
 *
 * Transmittance represents the architectural
 * property through which condensed coherence
 * traverses contexts while preserving identity.
 */

import type {
  Recognition
} from "./Recognition.js";

export interface Transmittance {

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


export const Transmittance = {

  of(
    recognition: Recognition,
    sourceContext: string,
    targetContext: string
  ): Transmittance {

    return {
      recognition,
      sourceContext,
      targetContext
    };

  }

};