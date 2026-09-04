/**
 * Capability
 *
 * Represents the observable expression of coherent emergence.
 *
 * Capability completes the generative mechanism and enables coherent experience.
 */
export interface Capability {
  /**
   * Unique capability identifier.
   */
  readonly id: string;

  /**
   * Indicates whether the capability is observable.
   */
  readonly observable: boolean;

  /**
   * Emergent description of the capability.
   */
  readonly description: string;

  /**
   * Potency from which the capability emerged.
   */
  readonly potencyId?: string;

  /**
   * Indicates whether the capability preserves coherence.
   */
  readonly coherent: boolean;
}