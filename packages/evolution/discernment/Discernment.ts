// evolution/discernment/Discernment.ts

/**
 * Discernment
 *
 * Represents the coherent recognition through which
 * experience is evaluated and meaningful transformation
 * paths are identified.
 *
 * Discernment does not create change.
 * It reveals coherent directions for adaptation.
 */
export interface Discernment {
  /**
   * Unique discernment identifier.
   */
  readonly id: string;

  /**
   * Experience from which meaning is interpreted.
   */
  readonly experienceId: string;

  /**
   * Meaning identified from the experience.
   */
  readonly meaning: string;

  /**
   * Context in which the transformation is evaluated.
   */
  readonly context: string;

  /**
   * Indicates whether the recognized transformation
   * preserves coherence.
   */
  readonly coherent: boolean;

  /**
   * Indicates whether the transformation aligns
   * with system purpose.
   */
  readonly aligned: boolean;
}