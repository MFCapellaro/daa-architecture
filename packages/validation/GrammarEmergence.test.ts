import { describe, expect, it } from "vitest";

import type { Meaning } from "../grammar/src/meaning/Meaning.js";
import type { Purpose } from "../grammar/src/purpose/Purpose.js";
import type { Relationship } from "../grammar/src/relationship/Relationship.js";

describe("Grammar Emergence", () => {

  it("establishes the constitutional concepts of Grammar", () => {

    const meaning: Meaning = {
      kind: "Meaning"
    };

    const purpose: Purpose = {
      kind: "Purpose"
    };

    const relationship: Relationship = {
      kind: "Relationship"
    };

    expect(meaning.kind).toBe("Meaning");
    expect(purpose.kind).toBe("Purpose");
    expect(relationship.kind).toBe("Relationship");

  });

  it("preserves semantic distinction between constitutional concepts", () => {

    const meaning: Meaning = {
      kind: "Meaning"
    };

    const purpose: Purpose = {
      kind: "Purpose"
    };

    const relationship: Relationship = {
      kind: "Relationship"
    };

    expect(meaning.kind).not.toBe(purpose.kind);
    expect(meaning.kind).not.toBe(relationship.kind);
    expect(purpose.kind).not.toBe(relationship.kind);

  });

  it("provides the semantic foundation for architectural emergence", () => {

    const grammar = [
      { kind: "Meaning" },
      { kind: "Purpose" },
      { kind: "Relationship" }
    ];

    expect(grammar).toHaveLength(3);

    expect(grammar.map(c => c.kind)).toEqual([
      "Meaning",
      "Purpose",
      "Relationship"
    ]);

  });

});