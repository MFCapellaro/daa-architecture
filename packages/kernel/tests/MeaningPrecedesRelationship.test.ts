import { describe, expect, it } from "vitest";

import { MeaningPrecedesRelationship } from "../laws/MeaningPrecedesRelationship.js";
import type { KernelConcept } from "../KernelConcept.js";


describe("MeaningPrecedesRelationship Law", () => {

  it("defines relationships through meaningful concepts", () => {

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


    const law = MeaningPrecedesRelationship(
      meaning,
      relationship
    );


    expect(law.id)
      .toBe("meaning-precedes-relationship");


    expect(law.name)
      .toBe("Meaning Precedes Relationship");


    expect(law.definition)
      .toBeDefined();


    expect(law.relationships)
      .toHaveLength(1);


    expect(law.relationships[0].source)
      .toBe(meaning);


    expect(law.relationships[0].target)
      .toBe(relationship);


    expect(law.relationships[0].verb)
      .toBe("defines");

  });

});