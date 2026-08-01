import { describe, expect, it } from "vitest";

import type { Runtime } from "../Runtime.js";

describe("Runtime", () => {

  it("preserves runtime identity", () => {

    const runtime: Runtime = {

      id: "runtime",

      name: "Runtime",

      capabilities: [
        "navigation",
        "execution"
      ]

    };

    expect(runtime.id).toBe("runtime");

    expect(runtime.name).toBe("Runtime");

  });

  it("preserves runtime capabilities", () => {

    const runtime: Runtime = {

      id: "runtime",

      name: "Runtime",

      capabilities: [
        "navigation",
        "execution"
      ]

    };

    expect(runtime.capabilities).toContain("navigation");

    expect(runtime.capabilities).toContain("execution");

    expect(runtime.capabilities.length).toBe(2);

  });

});