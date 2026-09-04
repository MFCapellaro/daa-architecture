/**

* Characteristic
*
* Represents the semantic identity assigned to an observed product property.
*
* Observation preserves evidence.
* Characteristic gives that evidence semantic identity.
* Normalization establishes comparability.
  */

export interface Characteristic {
/**

* Unique characteristic identifier.
  */
  readonly id: string;

/**

* Semantic name assigned to the observed property.
  */
  readonly name: string;

/**

* Value preserved from the originating observation.
  */
  readonly value: unknown;

/**

* Unit preserved from the originating observation, when applicable.
  */
  readonly unit?: string;

/**

* Identifier of the observation from which the characteristic emerged.
  */
  readonly observationId: string;
  }
