/**
 * DAA Nexus
 * ------------------------------
 * Ecosystem Recognition
 *
 * Recognition identifies coherent
 * trajectories already present within
 * a compiled ecosystem.
 *
 * Recognition does not create
 * relationships.
 *
 * It reveals the identity,
 * capabilities and context through
 * which future coherent relationships
 * may become possible.
 */

import type { EcosystemCompilation } from "../compilation/EcosystemCompilation.js";

import type { KernelConcept } from "../../../kernel/KernelConcept.js";
import type { KernelRelationship } from "../../../kernel/KernelRelationship.js";

import type { Capability } from "../../../generation/capability/Capability.js";


export interface EcosystemRecognition {

  /**
   * Compiled ecosystem from which
   * coherent trajectories are recognized.
   */
  readonly compilation: EcosystemCompilation;


  /**
   * Identities recognized within
   * the ecosystem.
   */
  readonly identities: readonly KernelConcept[];


  /**
   * Capabilities recognized as
   * evolutionary expressions.
   */
  readonly capabilities: readonly Capability[];


  /**
   * Relationships already existing
   * within the ecosystem.
   *
   * Recognition observes existing
   * relationships but does not reveal
   * new compatibility yet.
   */
  readonly relationships: readonly KernelRelationship[];

}