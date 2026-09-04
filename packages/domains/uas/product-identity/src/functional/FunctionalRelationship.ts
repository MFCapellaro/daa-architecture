/**
 * Functional Relationship
 *
 * Represents a meaningful relationship between discerned functions.
 *
 * A functional relationship does not establish capability by itself.
 * It describes how functions relate within a product context.
 */

import type { FunctionalDiscernment } from "./FunctionalDiscernment.js";

export interface FunctionalRelationship {
  /**
   * Unique relationship identifier.
   */
  readonly id: string;

  /**
   * Function from which the relationship originates.
   */
  readonly sourceFunctionId: string;

  /**
   * Function toward which the relationship is directed.
   */
  readonly targetFunctionId: string;

  /**
   * Semantic relationship between the two functions.
   */
  readonly relationship: string;

  /**
   * Product or operational context in which the relationship applies.
   */
  readonly context: string;
}

export function relateFunctions(
  source: FunctionalDiscernment,
  target: FunctionalDiscernment,
  relationship: string,
  context: string,
): FunctionalRelationship {
  return {
    id: `${source.id}:${relationship}:${target.id}`,
    sourceFunctionId: source.id,
    targetFunctionId: target.id,
    relationship,
    context,
  };
}