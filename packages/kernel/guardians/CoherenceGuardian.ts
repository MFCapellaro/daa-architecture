/**
 * DAA Kernel
 * ------------------------------
 * CoherenceGuardian
 *
 * Coordinates specialized guardians
 * to evaluate system coherence.
 */

import type { Guardian } from "./Guardian.js";
import {
  CoherenceAssessment
} from "../dynamics/CoherenceAssessment.js";


export interface CoherenceGuardian {

  readonly name: string;

  evaluate<T>(
    subject: T,
    guardians: readonly Guardian<T>[]
  ): CoherenceAssessment;

}


export const CoherenceGuardian = {

  create(): CoherenceGuardian {

    return {

      name: "Coherence Guardian",

      evaluate<T>(
        subject: T,
        guardians: readonly Guardian<T>[]
      ): CoherenceAssessment {

        const observations =
          guardians.map(
            guardian =>
              guardian.observe(subject)
          );


        const coherent =
          observations.every(
            observation => observation
          );


        const score =
          observations.length === 0
            ? 0
            : observations.filter(
                observation => observation
              ).length / observations.length;


        return CoherenceAssessment.of(

          coherent,

          score,

          coherent
            ? [
                "All guardians observe coherent conditions."
              ]
            : [
                "One or more guardians detected incoherence."
              ]

        );

      }

    };

  }

} as const;