/**
 * Interaction
 *
 * Establishes coherent relationships between compatible potentials.
 *
 * Interaction does not create potential.
 * It enables the conditions through which collective potency emerges.
 */
export interface Interaction {
  /**
   * Unique interaction identifier.
   */
  readonly id: string;

  /**
   * Participants involved in the interaction.
   */
  readonly participants: readonly string[];

  /**
   * Indicates whether the interaction preserves coherence.
   */
  readonly coherent: boolean;

  /**
   * Shared purpose that gives meaning to the interaction.
   */
  readonly purpose?: string;

  /**
   * Relationships established through the interaction.
   */
  readonly relationships?: readonly string[];
}