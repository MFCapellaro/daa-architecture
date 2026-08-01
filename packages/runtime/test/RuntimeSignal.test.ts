import { describe, expect, it } from "vitest";

import type { RuntimeSignal } from "../RuntimeSignal.js";

describe("RuntimeSignal", () => {

  it("preserves signal identity", () => {

    const signal: RuntimeSignal = {

      id: "signal",

      name: "Navigation Signal",

      description: "Reveals contextual conditions."

    };

    expect(signal.id).toBe("signal");

    expect(signal.name).toBe("Navigation Signal");

  });

  it("preserves signal description", () => {

    const signal: RuntimeSignal = {

      id: "signal",

      name: "Navigation Signal",

      description: "Reveals contextual conditions."

    };

    expect(signal.description)
      .toBe("Reveals contextual conditions.");

  });

});