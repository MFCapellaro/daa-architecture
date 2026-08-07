import { describe, expect, test } from "vitest";

import type { EcosystemRecognition } from "../src/recognition/EcosystemRecognition.js";
import type { EcosystemCompilation } from "../src/compilation/EcosystemCompilation.js";

import type { KernelConcept } from "../../kernel/KernelConcept.js";
import type { KernelRelationship } from "../../kernel/KernelRelationship.js";
import type { Capability } from "../../generation/capability/Capability.js";


describe("Ecosystem Recognition", () => {

  test("should recognize existing ecosystem conditions from compilation", () => {

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


    const recognition: EcosystemRecognition = {
      compilation,
      identities,
      capabilities,
      relationships,
    };


    expect(recognition.compilation)
      .toBe(compilation);

    expect(recognition.identities)
      .toBe(identities);

    expect(recognition.capabilities)
      .toBe(capabilities);

    expect(recognition.relationships)
      .toBe(relationships);

  });

});