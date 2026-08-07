import type { KernelConcept } from "../../../kernel/KernelConcept.js";
import type { Capability } from "../../../generation/capability/Capability.js";
import type { KernelRelationship } from "../../../kernel/KernelRelationship.js";

export interface EcosystemObservation {
  readonly identities: readonly KernelConcept[];

  readonly capabilities: readonly Capability[];

    readonly relationships: readonly KernelRelationship[];
}