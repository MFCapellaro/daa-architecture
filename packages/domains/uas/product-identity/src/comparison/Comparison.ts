import type { ProductClass } from "../classification/ProductClass.js";
import type { NormalizedCharacteristic } from "../normalization/CharacteristicNormalization.js";
import type { SemanticProduct } from "../product/SemanticProduct.js";

/**

* State of a comparison.
  */
  export type ComparisonState =
  | "prepared"
  | "comparable"
  | "partial"
  | "conditional"
  | "incomplete"
  | "incomparable";

/**

* Comparison
*
* Represents a prepared semantic relationship between
* products that share a Product Class.
*
* Comparison does not rank, select, or evaluate products.
* It establishes the context in which normalized
* relationships may become observable.
  */
  export interface Comparison {
  /**

  * Unique comparison identifier.
    */
    readonly id: string;

/**

* Shared Product Class.
  */
  readonly productClass: ProductClass;

/**

* Products participating in the comparison.
  */
  readonly products: SemanticProduct[];

/**

* Normalized characteristics selected for comparison.
  */
  readonly characteristics: NormalizedCharacteristic[];

/**

* Current comparative state.
  */
  readonly state: ComparisonState;
  }

export function createComparison(
id: string,
productClass: ProductClass,
products: SemanticProduct[],
characteristics: NormalizedCharacteristic[],
state: ComparisonState,
): Comparison {
if (!id.trim()) {
throw new Error(
"Comparison id cannot be empty.",
);
}

if (products.length < 2) {
throw new Error(
"A comparison requires at least two products.",
);
}

for (const product of products) {
if (
product.productClass &&
product.productClass.id !== productClass.id
) {
throw new Error(
"All products must belong to the same Product Class.",
);
}
}

return {
id,
productClass,
products,
characteristics,
state,
};
}
