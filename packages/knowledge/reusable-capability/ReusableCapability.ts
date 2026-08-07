/**
 * Reusable Capability
 *
 * Represents capability that has been integrated
 * through coherent learning and preserved as knowledge.
 *
 * Reusable Capability becomes available for
 * future generations and evolutionary adaptation.
 */
export interface ReusableCapability {
  /**
   * Unique reusable capability identifier.
   */
  readonly id: string;

  /**
   * Knowledge from which the capability emerged.
   */
  readonly knowledgeId: string;

  /**
   * Human-readable description.
   */
  readonly description: string;

  /**
   * Indicates whether the capability
   * has been validated through learning.
   */
  readonly validated: boolean;

  /**
   * Indicates whether the capability
   * preserves coherence.
   */
  readonly coherent: boolean;
}