/**

* Normalization Rule
*
* Defines an explicit semantic rule for mapping a characteristic
* identity to a normalized identity.
*
* A normalization rule does not alter the originating observation.
* It establishes the conditions under which characteristics may
* converge toward a shared semantic identity.
  */

export interface NormalizationRule {
/**

* Unique rule identifier.
  */
  readonly id: string;

/**

* Semantic identity recognized by the rule.
  */
  readonly normalizedId: string;

/**

* Human-readable normalized name.
  */
  readonly normalizedName: string;

/**

* Characteristic identities to which the rule applies.
  */
  readonly characteristicIds: readonly string[];

/**

* Contexts under which the rule is valid.
  */
  readonly contexts?: readonly string[];

/**

* Conditions under which the rule is valid.
  */
  readonly conditions?: readonly string[];
  }
