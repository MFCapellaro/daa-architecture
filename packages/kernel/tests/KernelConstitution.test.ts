import { describe, expect, it } from "vitest";

import { KernelConstitution } from "../KernelConstitution.js";

import { IdentityPreservation } from "../laws/IdentityPreservation.js";
import { MeaningPrecedesRelationship } from "../laws/MeaningPrecedesRelationship.js";
import { CoherenceTransformation } from "../laws/CoherenceTransformation.js";

import type { KernelConcept } from "../KernelConcept.js";


describe("KernelConstitution", () => {

  it("defines the fundamental laws of the kernel identity", () => {

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

    const variability: KernelConcept = {
      id: "variability",
      name: "Variability",
      definition:
        "Changing conditions that generate movement."
    };

    const movement: KernelConcept = {
      id: "movement",
      name: "Movement",
      definition:
        "Adaptive response under changing conditions."
    };


    const identityLaw = IdentityPreservation(
      identity,
      coherence
    );

    const meaningLaw = MeaningPrecedesRelationship(
      meaning,
      relationship
    );

    const coherenceLaw = CoherenceTransformation(
      coherence,
      variability,
      movement,
      identity
    );


    const constitution = KernelConstitution.define([
      identityLaw,
      meaningLaw,
      coherenceLaw
    ]);


    expect(constitution.name)
      .toBe("DAA Kernel Constitution");


    expect(constitution.laws)
      .toHaveLength(3);


    expect(
      constitution.laws.map(law => law.id)
    ).toContain(
      "identity-preservation"
    );


    expect(
      constitution.laws.map(law => law.id)
    ).toContain(
      "meaning-precedes-relationship"
    );


    expect(
      constitution.laws.map(law => law.id)
    ).toContain(
      "coherence-transformation"
    );

  });

});