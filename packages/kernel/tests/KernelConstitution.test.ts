import { describe, expect, it } from "vitest";

import { KernelConstitution } from "../KernelConstitution.js";
import { IdentityPreservation } from "../laws/IdentityPreservation.js";
import { MeaningPrecedesRelationship } from "../laws/MeaningPrecedesRelationship.js";

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


    const identityLaw = IdentityPreservation(
      identity,
      coherence
    );

    const meaningLaw = MeaningPrecedesRelationship(
      meaning,
      relationship
    );


    const constitution = KernelConstitution.define([
      identityLaw,
      meaningLaw
    ]);


    expect(constitution.name)
      .toBe("DAA Kernel Constitution");


    expect(constitution.laws)
      .toHaveLength(2);


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

  });

});