/**
 * DAA Kernel
 * ------------------------------
 * AdaptiveAction Test
 *
 * Validates adaptive responses
 * derived from coherence assessments.
 */

import {
  describe,
  expect,
  it
} from "vitest";

import {
  AdaptiveAction
} from "../dynamics/AdaptiveAction.js";

import {
  CoherenceAssessment
} from "../dynamics/CoherenceAssessment.js";


describe(
  "AdaptiveAction",
  () => {


    it(
      "creates an adaptive action from a coherent assessment",
      () => {

        const assessment =
          CoherenceAssessment.of(
            true,
            0.95,
            [
              "Identity preserved.",
              "Relationships remain coherent."
            ]
          );


        const action =
          AdaptiveAction.of(
            assessment,
            "Maintain coherent trajectory."
          );


        expect(
          action.assessment
        )
        .toBe(
          assessment
        );


        expect(
          action.description
        )
        .toBe(
          "Maintain coherent trajectory."
        );

      }
    );


    it(
      "creates an adaptive action from a non coherent assessment",
      () => {

        const assessment =
          CoherenceAssessment.of(
            false,
            0.25,
            [
              "Relationship continuity weakened."
            ]
          );


        const action =
          AdaptiveAction.of(
            assessment,
            "Restore coherent trajectory."
          );


        expect(
          action.assessment
        )
        .toBe(
          assessment
        );


        expect(
          action.assessment.coherent
        )
        .toBe(false);


        expect(
          action.description
        )
        .toBe(
          "Restore coherent trajectory."
        );

      }
    );


  }
);