import { describe, expect, it } from "vitest";

import { IdentityGuardian } from "../guardians/IdentityGuardian.js";
import type { KernelConcept } from "../KernelConcept.js";


describe("IdentityGuardian", () => {

  it("preserves identity with semantic definition", () => {

    const identity: KernelConcept = {
      id: "identity",
      name: "System Identity",
      definition:
        "The persistent essence that remains coherent through evolution."
    };


    const guardian = IdentityGuardian.create();


    expect(
      guardian.preserve(identity)
    ).toBe(true);

  });


  it("rejects identity without semantic definition", () => {

    const identity: KernelConcept = {
      id: "identity",
      name: "System Identity",
      definition: ""
    };


    const guardian = IdentityGuardian.create();


    expect(
      guardian.preserve(identity)
    ).toBe(false);

  });

});