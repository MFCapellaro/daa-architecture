import { describe, expect, it } from "vitest";

import { KernelConstitution } from "../KernelConstitution.js";
import { IdentityPreservation } from "../laws/IdentityPreservation.js";
import { MeaningPrecedesRelationship } from "../laws/MeaningPrecedesRelationship.js";

import type { KernelConcept } from "../KernelConcept.js";


describe("Constitution Guardian", () => {

  it("preserves constitutional laws during evolution", () => {

    const identity: KernelConcept = {
      id: "identity",
      name: "Identity",
      definition:
        "The persistent essence of a system across change."
    };

    const coherence: KernelConcept = {
      id: "coherence",
      name: "Coherence",
      definition:
        "The preservation of relationships that maintain identity."
    };

    const meaning: KernelConcept = {
      id: "meaning",
      name: "Meaning",
      definition:
        "The semantic foundation that gives significance to concepts."
    };

    const relationship: KernelConcept = {
      id: "relationship",
      name: "Relationship",
      definition:
        "A structural connection between concepts."
    };


    const constitution = KernelConstitution.define([
      IdentityPreservation(
        identity,
        coherence
      ),

      MeaningPrecedesRelationship(
        meaning,
        relationship
      )
    ]);


    const preservesConstitution = (
      lawIds: readonly string[]
    ): boolean => {

      return constitution.laws.every(
        law => lawIds.includes(law.id)
      );

    };


    expect(
      preservesConstitution([
        "identity-preservation",
        "meaning-precedes-relationship"
      ])
    ).toBe(true);


    expect(
      preservesConstitution([
        "identity-preservation"
      ])
    ).toBe(false);

  });

});