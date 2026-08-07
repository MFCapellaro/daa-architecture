/**
 * DAA Nexus
 * ------------------------------
 * Ecosystem Compilation
 *
 * Compilation organizes the living
 * substrate revealed through observation.
 *
 * It does not interpret possibilities.
 *
 * It makes identities, capabilities,
 * contexts and relationships observable
 * as a coherent ecosystem structure.
 */

import type { KernelConcept } from "../../../kernel/KernelConcept.js";
import type { KernelRelationship } from "../../../kernel/KernelRelationship.js";
import type { Capability } from "../../../generation/capability/Capability.js";


export interface EcosystemCompilation {

  /**
   * Recognized identities present
   * within the ecosystem substrate.
   */
  readonly identities: readonly KernelConcept[];


  /**
   * Capabilities expressed within
   * the ecosystem.
   */
  readonly capabilities: readonly Capability[];


  /**
   * Contexts associated with
   * ecosystem elements.
   */
  readonly contexts: readonly KernelConcept[];


  /**
   * Existing relationships observed
   * within the ecosystem.
   */
  readonly relationships: readonly KernelRelationship[];

}