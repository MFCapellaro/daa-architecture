import { describe, expect, it } from "vitest";

import { GuardianRegistry } from "../guardians/GuardianRegistry.js";


describe("GuardianRegistry", () => {

  it("registers and retrieves guardians", () => {

    const registry =
      new GuardianRegistry();


    const guardian = {

      name: "Test Guardian",

      observe() {
        return true;
      }

    };


    registry.register(
      guardian
    );


    expect(
      registry.get("Test Guardian")
    )
      .toBeDefined();


    expect(
      registry.list()
    )
      .toContain("Test Guardian");

  });

});