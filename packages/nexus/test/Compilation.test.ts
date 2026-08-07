import { describe, expect, test } from "vitest";

import type { EcosystemCompilation } from "../src/compilation/EcosystemCompilation.js";

import type { KernelConcept } from "../../kernel/KernelConcept.js";
import type { KernelRelationship } from "../../kernel/KernelRelationship.js";
import type { Capability } from "../../generation/capability/Capability.js";


describe("Ecosystem Compilation", () => {

  test("should organize observed ecosystem elements without altering meaning", () => {

    const identities: KernelConcept[] = [];

    const capabilities: Capability[] = [];

    const relationships: KernelRelationship[] = [];

    const contexts: KernelConcept[] = [];


    const compilation: EcosystemCompilation = {
      identities,
      capabilities,
      relationships,
      contexts,
    };


    expect(compilation.identities)
      .toBe(identities);

    expect(compilation.capabilities)
      .toBe(capabilities);

    expect(compilation.relationships)
      .toBe(relationships);

    expect(compilation.contexts)
      .toBe(contexts);

  });

});