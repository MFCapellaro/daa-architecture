// evolution/adaptation/Adaptation.ts

/**
 * Adaptation
 *
 * Represents coherent transformation through which
 * systems integrate experience while preserving identity.
 *
 * Adaptation does not replace identity.
 * It transforms existing capability into expanded capability.
 */
export interface Adaptation {
  /**
   * Unique adaptation identifier.
   */
  readonly id: string;

  /**
   * Discernment that originated the adaptation.
   */
  readonly discernmentId: string;

  /**
   * Identity preserved through transformation.
   */
  readonly identityId: string;

  /**
   * Capability before adaptation.
   */
  readonly previousCapabilityId: string;

  /**
   * Capability resulting from coherent transformation.
   */
  readonly expandedCapabilityId: string;

  /**
   * Indicates whether identity was preserved.
   */
  readonly preservesIdentity: boolean;

  /**
   * Indicates whether coherence was maintained.
   */
  readonly coherent: boolean;
}