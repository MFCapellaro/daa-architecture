import { describe, expect, it } from "vitest";
import type { Possibilities } from "../src/Possibilities.js";

describe("Possibilities", () => {
  it("defines the capability that coordinates coherent possibilities", () => {
    const possibilities: Possibilities = {
      coherent: true
    };

    expect(possibilities.coherent).toBe(true);
  });
});