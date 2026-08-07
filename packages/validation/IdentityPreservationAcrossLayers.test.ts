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

describe("Identity Preservation Across Layers", () => {

  it("preserves identity while enriching it through the complete architectural lifecycle", () => {

    const identity = {
      id: "identity-001"
    };

    const potential: Potential = {
      id: "potential-001",
      description: "Coherent potential",
      context: "DAA"
    };

    const interaction: Interaction = {
      id: "interaction-001",
      participants: [identity.id],
      coherent: true
    };

    const potency: Potency = {
      id: "potency-001",
      emerged: true,
      relationships: [interaction.id]
    };

    const emergence: Emergence = {
      id: "emergence-001",
      potencyId: potency.id,
      observable: true
    };

    const capability: Capability = {
      id: "capability-001",
      observable: true,
      description: "Emergent capability",
      potencyId: potency.id,
      coherent: true
    };

    const experience: Experience = {
      id: "experience-001",
      context: "Runtime",
      event: capability.description
    };

    const observation: Observation = {
      id: "observation-001",
      source: experience,
      signal: "Observed capability"
    };

    const learning: Learning = {
      id: "learning-001",
      observations: [observation],
      pattern: "Reusable pattern"
    };

    const reusableCapability: ReusableCapability = {
      id: "rc-001",
      knowledgeId: "knowledge-001",
      description: "Validated reusable capability",
      validated: true,
      coherent: true
    };

    const knowledge: Knowledge = {
      id: "knowledge-001",
      learning: [learning],
      reusableCapability: reusableCapability.id
    };

    const discernment: Discernment = {
      id: "discernment-001",
      experienceId: experience.id,
      meaning: "Capability can enrich identity",
      context: "DAA",
      coherent: true,
      aligned: true
    };

    const adaptation: Adaptation = {
      id: "adaptation-001",
      discernmentId: discernment.id,
      identityId: identity.id,
      previousCapabilityId: capability.id,
      reusableCapabilityId: reusableCapability.id,
      enrichedIdentityId: "identity-002",
      coherent: true
    };

    const evolution: Evolution = {
      id: "evolution-001",
      adaptationId: adaptation.id,
      enrichedIdentityId: adaptation.enrichedIdentityId
    };

    expect(interaction.coherent).toBe(true);
    expect(capability.coherent).toBe(true);
    expect(reusableCapability.coherent).toBe(true);
    expect(discernment.coherent).toBe(true);
    expect(adaptation.coherent).toBe(true);

    expect(adaptation.identityId).toBe(identity.id);

    expect(evolution.enrichedIdentityId)
      .toBe(adaptation.enrichedIdentityId);

    expect(evolution.enrichedIdentityId)
      .not.toBe(identity.id);

    expect(knowledge.reusableCapability)
      .toBe(reusableCapability.id);

    expect(reusableCapability.validated)
      .toBe(true);

  });

});