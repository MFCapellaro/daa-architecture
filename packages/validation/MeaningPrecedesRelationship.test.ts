import { describe, expect, it } from "vitest";

import type { Meaning } from "../grammar/src/meaning/Meaning.js";
import type { Purpose } from "../grammar/src/purpose/Purpose.js";
import type { Relationship } from "../grammar/src/relationship/Relationship.js";

describe("Meaning Precedes Relationship", () => {

  it("preserves the constitutional concepts of Grammar", () => {

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

  it("recognizes Meaning as an independent constitutional concept", () => {

    const meaning: Meaning = {
      kind: "Meaning"
    };

    expect(meaning.kind).not.toBe("Relationship");
    expect(meaning.kind).not.toBe("Purpose");

  });

  it("recognizes Relationship as a distinct constitutional concept", () => {

    const relationship: Relationship = {
      kind: "Relationship"
    };

    expect(relationship.kind).not.toBe("Meaning");
    expect(relationship.kind).not.toBe("Purpose");

  });

});