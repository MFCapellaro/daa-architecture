/**
 * DAA Kernel
 * ------------------------------
 * CoherenceEvaluator Test
 *
 * Validates coherence evaluation
 * over relationship trajectories.
 */

import {
  describe,
  expect,
  it
} from "vitest";

import {
  CoherenceEvaluator
} from "../dynamics/CoherenceEvaluator.js";

import {
  RelationshipTrajectory
} from "../dynamics/RelationshipTrajectory.js";

import {
  RelationshipAdjustment
} from "../dynamics/RelationshipAdjustment.js";

import {
  KernelRelationship
} from "../KernelRelationship.js";

import {
  Verbs
} from "../Verb.js";

import type {
  KernelConcept
} from "../KernelConcept.js";


describe(
  "CoherenceEvaluator",
  () => {


    it(
      "evaluates a coherent relationship trajectory",
      () => {

        const source: KernelConcept = {
          id: "meaning",
          name: "Meaning",
          definition:
            "The semantic foundation of the system."
        };


        const target: KernelConcept = {
          id: "purpose",
          name: "Purpose",
          definition:
            "The direction provided by meaning."
        };


        const previous =
          KernelRelationship.of(
            source,
            Verbs.Gives,
            target
          );


        const current =
          KernelRelationship.of(
            source,
            Verbs.Guides,
            target
          );


        const adjustment: RelationshipAdjustment = {
          previous,
          current
        };


        const trajectory =
          RelationshipTrajectory.of([
            adjustment
          ]);


        const evaluator =
          CoherenceEvaluator.create();


        const assessment =
          evaluator.evaluate(
            trajectory
          );


        expect(
          assessment.coherent
        )
        .toBe(true);


        expect(
          assessment.score
        )
        .toBe(1);


        expect(
          assessment.observations
        )
        .toContain(
          "Trajectory preserves coherent continuity."
        );

      }
    );


    it(
      "evaluates an empty trajectory as non coherent",
      () => {

        const trajectory =
          RelationshipTrajectory.of([]);


        const evaluator =
          CoherenceEvaluator.create();


        const assessment =
          evaluator.evaluate(
            trajectory
          );


        expect(
          assessment.coherent
        )
        .toBe(false);


        expect(
          assessment.score
        )
        .toBe(0);


        expect(
          assessment.observations
        )
        .toContain(
          "Trajectory contains no relationship adjustments."
        );

      }
    );


  }
);