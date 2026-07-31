import { describe, expect, it } from "vitest";

import { Meaning } from "../../kernel/concepts/Meaning.js";
import { Recognition } from "../Recognition.js";

describe("Recognition", () => {

  it("creates a recognition preserving coherence and context", () => {

    const recognition = Recognition.of(
      Meaning,
      "kernel"
    );

    expect(recognition.coherence).toBe(Meaning);

    expect(recognition.context).toBe("kernel");

  });

});