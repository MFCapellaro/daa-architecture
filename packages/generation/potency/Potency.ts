/**
 * Potency
 *
 * Represents the collective capability emerging from coherent interaction.
 *
 * Potency is not an individual property.
 * It belongs to coherent relationships.
 */
export interface Potency {
  /**
   * Unique potency identifier.
   */
  readonly id: string;

  /**
   * Indicates whether potency emerged from coherent interaction.
   */
  readonly emerged: boolean;

  /**
   * Coherent relationships from which potency emerged.
   */
  readonly relationships: readonly string[];

  /**
   * Relative strength of the collective potency.
   */
  readonly level?: number;

  /**
   * Description of the emergent collective capability.
   */
  readonly capability?: string;
}