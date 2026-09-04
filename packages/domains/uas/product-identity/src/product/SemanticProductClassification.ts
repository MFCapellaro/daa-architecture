import type { ProductClass } from "../classification/ProductClass.js";
import type { ProductClassification } from "../classification/ProductClassification.js";
import type { ProductClassReference } from "./SemanticProduct.js";

/**

* Creates the semantic product-class reference
* produced by a product classification.
*
* The classification remains the authoritative relationship.
* The reference is only the representation carried
* by SemanticProduct.
  */
  export function createProductClassReference(
  classification: ProductClassification,
  ): ProductClassReference {
  const productClass: ProductClass = classification.productClass;

return {
id: productClass.id,
name: productClass.name,
};
}
