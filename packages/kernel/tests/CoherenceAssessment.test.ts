/**
 * DAA Kernel
 * ------------------------------
 * CoherenceAssessment Test
 *
 * Validates the semantic result
 * of coherence evaluation.
 */

import {
  describe,
  expect,
  it
} from "vitest";

import {
  CoherenceAssessment
} from "../dynamics/CoherenceAssessment.js";


describe(
  "CoherenceAssessment",
  () => {

    it(
      "creates a coherent assessment",
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


        expect(
          assessment.coherent
        )
        .toBe(true);


        expect(
          assessment.score
        )
        .toBe(0.95);


        expect(
          assessment.observations
        )
        .toHaveLength(2);


        expect(
          assessment.observations
        )
        .toContain(
          "Identity preserved."
        );

      }
    );


    it(
      "creates a non coherent assessment",
      () => {

        const assessment =
          CoherenceAssessment.of(
            false,
            0.25,
            [
              "Relationship continuity weakened."
            ]
          );


        expect(
          assessment.coherent
        )
        .toBe(false);


        expect(
          assessment.score
        )
        .toBe(0.25);


        expect(
          assessment.observations[0]
        )
        .toBe(
          "Relationship continuity weakened."
        );

      }
    );

  }
);