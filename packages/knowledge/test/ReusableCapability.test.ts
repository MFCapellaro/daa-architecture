import { describe, expect, test } from "vitest";

import {
  ReusableCapability
} from "../index.js";

describe("ReusableCapability", () => {

  test("preserves validated capability for future generations", () => {

    const reusableCapability: ReusableCapability = {
      id: "reusable-capability",
      knowledgeId: "knowledge",
      description: "coherent architectural composition",
      validated: true,
      coherent: true
    };

    expect(reusableCapability.knowledgeId)
      .toBe("knowledge");

    expect(reusableCapability.description)
      .toBe("coherent architectural composition");

    expect(reusableCapability.validated)
      .toBe(true);

    expect(reusableCapability.coherent)
      .toBe(true);

  });

});