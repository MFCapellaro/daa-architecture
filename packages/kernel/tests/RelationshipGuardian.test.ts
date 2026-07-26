import { describe, expect, it } from "vitest";

import { RelationshipGuardian } from "../guardians/RelationshipGuardian.js";
import { KernelRelationship } from "../KernelRelationship.js";
import { Verbs } from "../Verb.js";

import type { KernelConcept } from "../KernelConcept.js";


describe("RelationshipGuardian", () => {

  it("preserves relationships between meaningful concepts", () => {

    const source: KernelConcept = {
      id: "meaning",
      name: "Meaning",
      definition:
        "The semantic foundation of the system."
    };

    const target: KernelConcept = {
      id: "relationship",
      name: "Relationship",
      definition:
        "A connection between system concepts."
    };


    const relationship = KernelRelationship.of(
      source,
      Verbs.Defines,
      target
    );


    const guardian = RelationshipGuardian.create();


    expect(
      guardian.preserve(relationship)
    ).toBe(true);

  });


  it("rejects relationships without semantic foundations", () => {

    const source: KernelConcept = {
      id: "empty",
      name: "Undefined",
      definition: ""
    };

    const target: KernelConcept = {
      id: "relationship",
      name: "Relationship",
      definition:
        "A connection between system concepts."
    };


    const relationship = KernelRelationship.of(
      source,
      Verbs.Defines,
      target
    );


    const guardian = RelationshipGuardian.create();


    expect(
      guardian.preserve(relationship)
    ).toBe(false);

  });

});