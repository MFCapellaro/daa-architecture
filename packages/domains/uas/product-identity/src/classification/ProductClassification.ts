import type { ProductCapability } from "../product/ProductCapability.js";
import type { ProductClass } from "./ProductClass.js";

/**

* Classification scope.
*
* Intra-brand classification operates within a brand context.
* Cross-brand classification operates across brand boundaries.
  */
  export type ClassificationScope =
  | "intra-brand"
  | "cross-brand";

/**

* Product Classification
*
* Represents the relationship between a capability
* and the Product Class in which that capability is classified.
*
* Classification is reciprocal:
*
* Capability → ProductClass
* ProductClass → Capability
*
* The relationship preserves both identities without
* redefining either concept.
  */
  export interface ProductClassification {
  /**

  * Unique classification identifier.
    */
    readonly id: string;

/**

* Capability being classified.
  */
  readonly capability: ProductCapability;

/**

* Product Class assigned to the capability.
  */
  readonly productClass: ProductClass;

/**

* Semantic scope of the classification.
  */
  readonly scope: ClassificationScope;
  }

export function classifyCapability(
  capability: ProductCapability,
  productClass: ProductClass,
  scope: ClassificationScope,
): ProductClassification {
  return {
    id: `${capability.id}:${productClass.id}`,
    capability,
    productClass,
    scope,
  };
}
