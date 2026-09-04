/**
 * Product Class
 *
 * Represents the identity of a class within a product
 * classification scheme.
 *
 * A Product Class does not classify a capability itself.
 * It defines the semantic identity of the class to which
 * a capability may be assigned.
 */

export interface ProductClass {
  /**
   * Unique class identifier.
   */
  readonly id: string;

  /**
   * Human-readable class name.
   */
  readonly name: string;

  /**
   * Classification scheme that defines the class.
   */
  readonly scheme: string;

  /**
   * Semantic description of the class.
   */
  readonly description: string;
}

export function createProductClass(
  id: string,
  name: string,
  scheme: string,
  description: string,
): ProductClass {
  if (!id.trim()) {
    throw new Error(
      "Product Class id cannot be empty.",
    );
  }

  if (!name.trim()) {
    throw new Error(
      "Product Class name cannot be empty.",
    );
  }

  if (!scheme.trim()) {
    throw new Error(
      "Product Class scheme cannot be empty.",
    );
  }

  if (!description.trim()) {
    throw new Error(
      "Product Class description cannot be empty.",
    );
  }

  return {
    id,
    name,
    scheme,
    description,
  };
}