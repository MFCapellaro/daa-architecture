/**
 * DAA Kernel
 * ------------------------------
 * Core Relationships
 *
 * Fundamental relationships that
 * express adaptive coherence.
 */

import { KernelRelationship } from "../KernelRelationship.js";
import {
  Identity,
  Relationship,
  Variability,
  Coherence,
  Movement,
  Uncertainty,
  Potency
} from "../concepts/CoreConcepts.js";

import { Verbs } from "../Verb.js";


export const CoherencePreservesIdentity =
  KernelRelationship.of(
    Coherence,
    Verbs.Preserves,
    Identity
  );


export const RelationshipsCreateMeaning =
  KernelRelationship.of(
    Relationship,
    Verbs.Creates,
    Coherence
  );


export const VariabilityGeneratesMovement =
  KernelRelationship.of(
    Variability,
    Verbs.Generates,
    Movement
  );


export const CoherenceOrganizesMovement =
  KernelRelationship.of(
    Coherence,
    Verbs.Organizes,
    Movement
  );


export const CoherenceEnablesAction =
  KernelRelationship.of(
    Coherence,
    Verbs.Enables,
    Movement
  );


export const CoherenceRevealsPotency =
  KernelRelationship.of(
    Coherence,
    Verbs.Reveals,
    Potency
  );


export const UncertaintyGuidesAdaptation =
  KernelRelationship.of(
    Uncertainty,
    Verbs.Guides,
    Coherence
  );


export const CoreRelationships = [
  CoherencePreservesIdentity,
  RelationshipsCreateMeaning,
  VariabilityGeneratesMovement,
  CoherenceOrganizesMovement,
  CoherenceEnablesAction,
  CoherenceRevealsPotency,
  UncertaintyGuidesAdaptation
] as const;