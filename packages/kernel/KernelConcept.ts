/**
 * Base definition for every irreducible concept
 * of the DAA Kernel.
 */
export interface KernelConcept {
  readonly id: string;
  readonly name: string;
  readonly definition: string;
}