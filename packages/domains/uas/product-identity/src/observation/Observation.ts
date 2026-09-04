/**

* Observation
*
* Represents a piece of product evidence preserved from a source.
*
* Observation preserves what was observed, including its original
* terminology, value, unit, context and conditions.
*
* Observation does not establish semantic identity, normalization,
* classification or comparison.
  */

export type EvidenceStatus =
| "observed"
| "corroborated"
| "unresolved";

export interface Observation {
/**

* Unique observation identifier.
  */
  readonly id: string;

/**

* Original terminology used by the source.
  */
  readonly rawLabel: string;

/**

* Value as observed.
*
* No normalization or semantic transformation is performed here.
  */
  readonly observedValue: unknown;

/**

* Unit as provided by the source, when applicable.
  */
  readonly unit?: string;

/**

* Operational or semantic context in which the value was observed.
  */
  readonly context?: string;

/**

* Condition under which the observation applies.
  */
  readonly condition?: string;

/**

* System associated with the observation, when identified.
  */
  readonly observedSystem?: string;

/**

* References to the sources supporting this observation.
  */
  readonly sources: readonly string[];

/**

* Evidential status of the observation.
  */
  readonly evidenceStatus: EvidenceStatus;
  }
