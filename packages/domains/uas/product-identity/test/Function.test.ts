import { describe, expect, it } from "vitest";

import {
  createFunction,
  type Function,
} from "../src/functional/Function.js";

describe("Function", () => {
  it("creates a function from a functional discernment", () => {
    const discernmentId =
      "maximum-spray-flow-rate:Deliver Spray Material";

    const functional: Function = createFunction(
      "liquid-application",
      "Liquid Application",
      "Application of liquid material through an operational application system.",
      "Agricultural Treatment",
      discernmentId,
    );

    expect(functional.id).toBe("liquid-application");
    expect(functional.name).toBe("Liquid Application");
    expect(functional.definition).toBe(
      "Application of liquid material through an operational application system.",
    );
    expect(functional.context).toBe("Agricultural Treatment");
    expect(functional.discernmentId).toBe(discernmentId);
  });

  it("preserves the functional discernment as its origin", () => {
    const discernmentId = "spread-width:Distribute Material";

    const functional = createFunction(
      "material-application",
      "Material Application",
      "Distribution of agricultural material over an operational area.",
      "Agricultural Treatment",
      discernmentId,
    );

    expect(functional.discernmentId).toBe(discernmentId);
  });

  it("rejects an empty function id", () => {
    expect(() =>
      createFunction(
        "",
        "Liquid Application",
        "Application of liquid material.",
        "Agricultural Treatment",
        "discernment-01",
      ),
    ).toThrow("Function id cannot be empty.");
  });

  it("rejects an empty function name", () => {
    expect(() =>
      createFunction(
        "liquid-application",
        "",
        "Application of liquid material.",
        "Agricultural Treatment",
        "discernment-01",
      ),
    ).toThrow("Function name cannot be empty.");
  });

  it("rejects an empty definition", () => {
    expect(() =>
      createFunction(
        "liquid-application",
        "Liquid Application",
        "",
        "Agricultural Treatment",
        "discernment-01",
      ),
    ).toThrow("Function definition cannot be empty.");
  });

  it("rejects an empty context", () => {
    expect(() =>
      createFunction(
        "liquid-application",
        "Liquid Application",
        "Application of liquid material.",
        "",
        "discernment-01",
      ),
    ).toThrow("Function context cannot be empty.");
  });

  it("rejects an empty discernment origin", () => {
    expect(() =>
      createFunction(
        "liquid-application",
        "Liquid Application",
        "Application of liquid material.",
        "Agricultural Treatment",
        "",
      ),
    ).toThrow("Function discernmentId cannot be empty.");
  });
});