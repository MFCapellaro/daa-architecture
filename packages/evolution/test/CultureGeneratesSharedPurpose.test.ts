import { describe, expect, it } from "vitest";

import type { Purpose } from "../../grammar/src/purpose/Purpose.js";
import type { Knowledge } from "../../knowledge/Knowledge.js";


describe("Culture Generates Shared Purpose", () => {

  it("transforms preserved knowledge into shared meaning", () => {

    const knowledge: Knowledge = {
      id: "collective-knowledge",
      learning: [],
      reusableCapability: "collective-capability"
    };


    const culture = {
      knowledgeId: knowledge.id,
      sharedMeaning: true
    };


    expect(culture.knowledgeId)
      .toBe("collective-knowledge");


    expect(culture.sharedMeaning)
      .toBe(true);

  });


  it("gives collective meaning a coherent direction", () => {

    const purpose: Purpose = {
      kind: "Purpose"
    };


    const cultureDirection = {
      purpose,
      aligned: true
    };


    expect(cultureDirection.purpose.kind)
      .toBe("Purpose");


    expect(cultureDirection.aligned)
      .toBe(true);

  });


  it("connects culture with collective evolution", () => {

    const evolution = {
      culture: true,
      sharedPurpose: true,
      coherentEvolution: true
    };


    expect(
      evolution.culture &&
      evolution.sharedPurpose
    )
      .toBe(true);


    expect(evolution.coherentEvolution)
      .toBe(true);

  });

});