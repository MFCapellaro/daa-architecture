import { describe, expect, test } from "vitest";

import {
  Meaning,
  Purpose,
  Relationship,
  Structure,
  Identity
} from "../index.js";

import {
  MeaningPurpose
} from "../relationships/MeaningPurpose.js";

import {
  RelationshipStructure
} from "../relationships/RelationshipStructure.js";

import {
  StructureEmergence
} from "../laws/StructureEmergence.js";

import {
  CoherenceGuardian
} from "../guardians/CoherenceGuardian.js";


describe("DAA Kernel coherence", () => {

  test("Meaning gives Purpose", () => {
    expect(MeaningPurpose.source)
      .toBe(Meaning);

    expect(MeaningPurpose.target)
      .toBe(Purpose);
  });


  test("Relationship creates Structure", () => {
    expect(RelationshipStructure.source)
      .toBe(Relationship);

    expect(RelationshipStructure.target)
      .toBe(Structure);
  });


  test("StructureEmergence preserves relationship law", () => {
    expect(StructureEmergence.relationships)
      .toContain(RelationshipStructure);
  });


  test("Coherence Guardian protects Identity", () => {
    expect(CoherenceGuardian.protects)
      .toContain(Identity);

    expect(CoherenceGuardian.observes)
      .toContain(StructureEmergence);
  });

});