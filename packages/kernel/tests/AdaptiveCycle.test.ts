/**
 * DAA Kernel
 * ------------------------------
 * AdaptiveCycle Test
 *
 * Validates the complete dynamic
 * coherence adaptation cycle.
 */

import {
  describe,
  expect,
  it
} from "vitest";

import {
  AdaptiveCycle
} from "../dynamics/AdaptiveCycle.js";

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
  "AdaptiveCycle",
  () => {


    it(
      "transforms a coherent trajectory into an adaptive action",
      () => {

        const source: KernelConcept = {
          id: "identity",
          name: "Identity",
          definition:
            "The persistent essence of a system."
        };


        const target: KernelConcept = {
          id: "coherence",
          name: "Coherence",
          definition:
            "The preservation of coherent relationships."
        };


        const previous =
          KernelRelationship.of(
            source,
            Verbs.Preserves,
            target
          );


        const current =
          KernelRelationship.of(
            source,
            Verbs.Preserves,
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


        const cycle =
          AdaptiveCycle.create(
            evaluator
          );


        const action =
          cycle.process(
            trajectory
          );


        expect(
          action.assessment.coherent
        )
        .toBe(true);


        expect(
          action.assessment.score
        )
        .toBe(1);


        expect(
          action.description
        )
        .toBe(
          "Maintain coherent trajectory."
        );

      }
    );


  }
);