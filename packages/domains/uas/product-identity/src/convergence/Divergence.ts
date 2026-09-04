/**

* Divergence
*
* Records a meaningful distinction observed across distinct
* observations.
*
* Divergence does not establish incompatibility.
* It preserves evidence for later discernment.
  */

import type { Observation } from "../observation/Observation.js";

/**

* Evidential states of a divergence.
*
* A divergence may become progressively stronger as evidence
* is observed and corroborated.
  */
  export type DivergenceState =
  | "observed"
  | "recurring"
  | "corroborated"
  | "potentially-significant";

/**

* Levels at which divergence may be observed.
  */
  export type DivergenceLevel =
  | "lexical"
  | "structural"
  | "functional"
  | "operational"
  | "technological"
  | "contextual";

/**

* Divergence
*
* Represents a meaningful distinction between distinct
* observations.
  */
  export interface Divergence {
  /**

  * Unique divergence identifier.
    */
    readonly id: string;

/**

* Observations between which the divergence emerges.
  */
  readonly observations: Observation[];

/**

* Level at which the divergence was observed.
  */
  readonly level: DivergenceLevel;

/**

* Evidential state of the divergence.
  */
  readonly state: DivergenceState;
  }

/**

* Creates a divergence from distinct observations.
  */
  export function createDivergence(
  id: string,
  observations: Observation[],
  level: DivergenceLevel,
  state: DivergenceState,
  ): Divergence {
  if (!id.trim()) {
  throw new Error(
  "Divergence id cannot be empty.",
  );
  }

if (observations.length < 2) {
throw new Error(
"Divergence requires at least two observations.",
);
}

const observationIds = observations.map(
(observation) => observation.id,
);

if (new Set(observationIds).size !== observationIds.length) {
throw new Error(
"Divergence observations must be distinct.",
);
}

return {
id,
observations,
level,
state,
};
}
