import { describe, expect, test } from "vitest";

import {
  Potential,
  Possibility,
  Interaction,
  Potency,
  Emergence,
  Capability
} from "../../generation/index.js";

import {
  Experience,
  Observation,
  Learning,
  Knowledge,
  ReusableCapability
} from "../../knowledge/index.js";

import {
  Discernment,
  Adaptation,
  Evolution
} from "../../evolution/index.js";

import {
  Recognition,
  Transmittance,
  Propagation
} from "../../lux/index.js";

import { Meaning } from "../../kernel/concepts/Meaning.js";

describe("DAA Evolutionary Cycle", () => {

  test("preserves coherent identity across the complete architectural lifecycle", () => {

    // Generation

    const potential: Potential = {
      id: "potential",
      description: "coherent architectural possibility",
      context: "kernel"
    };

    const possibility: Possibility = {
      id: "possibility",
      source: potential,
      conditions: [
        "shared purpose"
      ]
    };

    const interaction: Interaction = {
      id: "interaction",
      participants: [
        "grammar",
        "kernel"
      ],
      coherent: true,
      purpose: "architectural evolution"
    };

    const potency: Potency = {
      id: "potency",
      emerged: true,
      relationships: [
        interaction.id
      ]
    };

    const capability: Capability = {
      id: "capability",
      observable: true,
      description: "coherent architectural capability",
      potencyId: potency.id,
      coherent: true
    };

    const emergence: Emergence = {
    id: "emergence",
    potencyId: potency.id,
    observable: true
    };

    // Knowledge

    const experience: Experience = {
      id: "experience",
      context: "generation",
      event: capability.description
    };

    const observation: Observation = {
      id: "observation",
      source: experience,
      signal: capability.description
    };

    const learning: Learning = {
      id: "learning",
      observations: [
        observation
      ],
      pattern: "preserved coherence"
    };

    const knowledge: Knowledge = {
      id: "knowledge",
      learning: [
        learning
      ],
      reusableCapability: capability.description
    };

    const reusableCapability: ReusableCapability = {
      id: "reusable",
      knowledgeId: knowledge.id,
      description: knowledge.reusableCapability,
      validated: true,
      coherent: true
    };

    // Evolution

    const discernment: Discernment = {
      id: "discernment",
      experienceId: experience.id,
      meaning: "coherence preserved",
      context: "architecture",
      coherent: true,
      aligned: true
    };

    const adaptation: Adaptation = {
      id: "adaptation",
      discernmentId: discernment.id,
      identityId: "daa",
      previousCapabilityId: capability.id,
      reusableCapabilityId: reusableCapability.id,
      enrichedIdentityId: "daa-v2",
      coherent: true
    };

    const evolution: Evolution = {
      id: "evolution",
      adaptationId: adaptation.id,
      enrichedIdentityId: adaptation.enrichedIdentityId
    };

    // LUX

    const recognition = Recognition.of(
      Meaning,
      "evolution"
    );

    const transmittance = Transmittance.of(
      recognition,
      "evolution",
      "ecosystem"
    );

    const propagation = Propagation.of(
      transmittance,
      "ecosystem"
    );

    // Assertions

    expect(possibility.source)
      .toBe(potential);

    expect(potency.relationships)
      .toContain(interaction.id);

    expect(capability.potencyId)
      .toBe(potency.id);

    expect(emergence.potencyId)
      .toBe(potency.id);

    expect(emergence.observable)
      .toBe(true);

    expect(observation.source)
      .toBe(experience);

    expect(knowledge.learning[0])
      .toBe(learning);

    expect(reusableCapability.knowledgeId)
      .toBe(knowledge.id);

    expect(adaptation.previousCapabilityId)
      .toBe(capability.id);

    expect(adaptation.reusableCapabilityId)
      .toBe(reusableCapability.id);

    expect(evolution.adaptationId)
      .toBe(adaptation.id);

    expect(evolution.enrichedIdentityId)
      .toBe(adaptation.enrichedIdentityId);

    expect(propagation.transmittance)
      .toBe(transmittance);

    expect(transmittance.recognition)
      .toBe(recognition);

  });

});