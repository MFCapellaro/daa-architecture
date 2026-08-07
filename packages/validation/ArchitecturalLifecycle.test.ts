import { describe, expect, it } from "vitest";

import type { Potential } from "../generation/potential/Potential.js";
import type { Interaction } from "../generation/interaction/Interaction.js";
import type { Potency } from "../generation/potency/Potency.js";
import type { Emergence } from "../generation/emergence/Emergence.js";
import type { Capability } from "../generation/capability/Capability.js";

import type { Experience } from "../knowledge/experience/Experience.js";
import type { Observation } from "../knowledge/observation/Observation.js";
import type { Learning } from "../knowledge/learning/Learning.js";
import type { Knowledge } from "../knowledge/Knowledge.js";
import type { ReusableCapability } from "../knowledge/reusable-capability/ReusableCapability.js";

import type { Discernment } from "../evolution/discernment/Discernment.js";
import type { Adaptation } from "../evolution/adaptation/Adaptation.js";
import type { Evolution } from "../evolution/evolution/Evolution.js";

describe("Architectural Lifecycle", () => {

  it("preserves coherence across the complete DAA lifecycle", () => {

    const potential: Potential = {
      id: "potential-1",
      description: "Agricultural expertise",
      context: "UAS"
    };

    const interaction: Interaction = {
      id: "interaction-1",
      participants: ["alice", "bob"],
      coherent: true
    };

    const potency: Potency = {
      id: "potency-1",
      emerged: true,
      relationships: [interaction.id]
    };

    const emergence: Emergence = {
      id: "emergence-1",
      potencyId: potency.id,
      observable: true
    };

    const capability: Capability = {
      id: "capability-1",
      observable: true,
      coherent: true,
      description: "Collaborative aerial spraying",
      potencyId: potency.id
    };

    const experience: Experience = {
      id: "experience-1",
      context: "Mission",
      event: capability.id
    };

    const observation: Observation = {
      id: "observation-1",
      source: experience,
      signal: "Successful mission"
    };

    const learning: Learning = {
      id: "learning-1",
      observations: [observation],
      pattern: "Shared expertise improves outcomes"
    };

    const reusableCapability: ReusableCapability = {
      id: "rc-1",
      knowledgeId: "knowledge-1",
      description: "Validated collaborative spraying strategy",
      validated: true,
      coherent: true
    };

    const knowledge: Knowledge = {
      id: "knowledge-1",
      learning: [learning],
      reusableCapability: reusableCapability.id
    };

    const discernment: Discernment = {
      id: "discernment-1",
      experienceId: experience.id,
      meaning: "Collaboration increases effectiveness",
      context: "UAS",
      coherent: true,
      aligned: true
    };

    const adaptation: Adaptation = {
      id: "adaptation-1",
      discernmentId: discernment.id,
      identityId: "identity-1",
      previousCapabilityId: capability.id,
      reusableCapabilityId: reusableCapability.id,
      enrichedIdentityId: "identity-2",
      coherent: true
    };

    const evolution: Evolution = {
      id: "evolution-1",
      adaptationId: adaptation.id,
      enrichedIdentityId: adaptation.enrichedIdentityId
    };

    expect(interaction.coherent).toBe(true);
    expect(potency.emerged).toBe(true);
    expect(emergence.observable).toBe(true);

    expect(capability.potencyId).toBe(potency.id);

    expect(observation.source.id).toBe(experience.id);
    expect(learning.observations[0]).toBe(observation);

    expect(knowledge.reusableCapability).toBe(reusableCapability.id);

    expect(adaptation.reusableCapabilityId)
      .toBe(reusableCapability.id);

    expect(evolution.enrichedIdentityId)
      .toBe(adaptation.enrichedIdentityId);

  });

});