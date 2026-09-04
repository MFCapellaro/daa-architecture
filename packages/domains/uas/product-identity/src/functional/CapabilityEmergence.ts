/**
 * Capability Emergence
 *
 * Consolidates a product capability from a coherent functional structure.
 *
 * Product Capability belongs to the Product Identity spiral.
 *
 * Capability emergence at this layer does not represent systemic emergence.
 * It consolidates capability already supported by the product's functional structure.
 */

import type { ProductCapability } from "../product/ProductCapability.js";
import type { FunctionalRelationship } from "./FunctionalRelationship.js";

export interface CapabilityEmergenceInput {
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  readonly relationships: readonly FunctionalRelationship[];
}

export function emergeCapability(
  input: CapabilityEmergenceInput,
): ProductCapability {
  if (input.relationships.length === 0) {
    throw new Error(
      "Product capability requires functional relationships.",
    );
  }

  const functionIds = [
    ...new Set(
      input.relationships.flatMap((relationship) => [
        relationship.sourceFunctionId,
        relationship.targetFunctionId,
      ]),
    ),
  ];

  return {
    id: input.id,
    productId: input.productId,
    name: input.name,
    functionIds,
    relationshipIds: input.relationships.map(
      (relationship) => relationship.id,
    ),
  };
}