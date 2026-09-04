import type { NormalizedCharacteristic } from "../normalization/CharacteristicNormalization.js";
import type { Comparison } from "./Comparison.js";

/**

* Semantic relationship types that may emerge from a comparison.
*
* These relationships describe what the comparison reveals.
* They do not perform evaluation or ranking.
  */
  export type ComparisonRelationshipType =
  | "equivalent"
  | "similar"
  | "different"
  | "complementary"
  | "incomparable";

/**

* Comparison Relationship
*
* Represents an observed semantic relationship between
* participants of a Comparison, grounded in a normalized
* characteristic.
  */
  export interface ComparisonRelationship {
  /**

  * Unique relationship identifier.
    */
    readonly id: string;

/**

* Comparison from which the relationship emerged.
  */
  readonly comparisonId: string;

/**

* First participant in the relationship.
  */
  readonly sourceId: string;

/**

* Second participant in the relationship.
  */
  readonly targetId: string;

/**

* Normalized characteristic supporting the relationship.
  */
  readonly characteristicId: string;

/**

* Semantic relationship observed between participants.
  */
  readonly type: ComparisonRelationshipType;
  }

/**

* Creates a relationship observed through a comparison.
  */
  export function createComparisonRelationship(
  comparison: Comparison,
  sourceId: string,
  targetId: string,
  characteristic: NormalizedCharacteristic,
  type: ComparisonRelationshipType,
  ): ComparisonRelationship {
  if (!sourceId.trim()) {
  throw new Error(
  "Comparison relationship source id cannot be empty.",
  );
  }

if (!targetId.trim()) {
throw new Error(
"Comparison relationship target id cannot be empty.",
);
}

if (sourceId === targetId) {
throw new Error(
"A comparison relationship requires distinct participants.",
);
}

const participantIds = comparison.products.map(
(product) => product.id,
);

if (!participantIds.includes(sourceId)) {
throw new Error(
"Comparison relationship source must belong to the comparison.",
);
}

if (!participantIds.includes(targetId)) {
throw new Error(
"Comparison relationship target must belong to the comparison.",
);
}

const characteristicExists = comparison.characteristics.some(
(item) => item.id === characteristic.id,
);

if (!characteristicExists) {
throw new Error(
"Comparison relationship characteristic must belong to the comparison.",
);
}

return {
id: `${comparison.id}:${sourceId}:${targetId}:${characteristic.id}:${type}`,
comparisonId: comparison.id,
sourceId,
targetId,
characteristicId: characteristic.id,
type,
};
}
