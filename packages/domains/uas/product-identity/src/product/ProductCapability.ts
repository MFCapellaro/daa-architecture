/**
 * Product Capability
 *
 * Represents capability consolidated from the functional structure
 * of a product.
 *
 * Product Capability belongs to the Product Identity spiral.
 *
 * It emerges from one or more product functions and their relationships.
 * It does not describe observable behavior.
 */

export interface ProductCapability {
  /**
   * Unique product capability identifier.
   */
  readonly id: string;

  /**
   * Product to which the capability belongs.
   */
  readonly productId: string;

  /**
   * Semantic name of the product capability.
   */
  readonly name: string;

  /**
   * Functions from which the capability is consolidated.
   */
  readonly functionIds: readonly string[];

  /**
   * Functional relationships contributing to the capability.
   */
  readonly relationshipIds: readonly string[];
}

/**
 * Creates a product capability from its functional structure.
 */
export function createProductCapability(
  id: string,
  productId: string,
  name: string,
  functionIds: readonly string[],
  relationshipIds: readonly string[] = [],
): ProductCapability {
  if (!id.trim()) {
    throw new Error("Product capability id cannot be empty.");
  }

  if (!productId.trim()) {
    throw new Error("Product capability productId cannot be empty.");
  }

  if (!name.trim()) {
    throw new Error("Product capability name cannot be empty.");
  }

  if (functionIds.length === 0) {
    throw new Error(
      "Product capability requires at least one function.",
    );
  }

  return {
    id,
    productId,
    name,
    functionIds,
    relationshipIds,
  };
}