import { describe, expect, test } from "vitest";

import {
  KernelRelationship,
  Verbs,
  Meaning,
  Purpose
} from "../index.js";


describe("DAA Kernel functionality", () => {

  test("creates a semantic relationship between concepts", () => {

    const relationship = KernelRelationship.of(
      Meaning,
      Verbs.Gives,
      Purpose
    );

    expect(relationship.source)
      .toBe(Meaning);

    expect(relationship.verb)
      .toBe(Verbs.Gives);

    expect(relationship.target)
      .toBe(Purpose);
  });


  test("generates a unique relationship identity", () => {

    const relationship = KernelRelationship.of(
      Meaning,
      Verbs.Gives,
      Purpose
    );

    expect(relationship.id)
      .toBe("meaning:gives:purpose");
  });

});