/**
 * DAA LUX
 * ------------------------------
 * Recognition
 *
 * Recognition represents the architectural
 * condition in which condensed coherence
 * becomes understandable within a context.
 */

import type {
  KernelConcept
} from "../kernel/KernelConcept.js";

export interface Recognition {

  /**
   * Coherence recognized
   * within the current context.
   */
  readonly coherence: KernelConcept;

  /**
   * Context in which coherence
   * becomes recognizable.
   */
  readonly context: string;

}


export const Recognition = {

  of(
    coherence: KernelConcept,
    context: string
  ): Recognition {

    return {
      coherence,
      context
    };

  }

};