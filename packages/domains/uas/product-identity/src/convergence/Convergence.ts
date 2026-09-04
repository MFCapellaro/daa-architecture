/**

* Convergence
*
* Records a recurring relationship observed across distinct
* observations.
*
* Convergence does not establish equivalence.
* It preserves evidence for later discernment.
  */

import type { Observation } from "../observation/Observation.js";

/**

* Evidential states of a convergence.
*
* A convergence may become progressively stronger as evidence
* is observed and corroborated.
  */
  export type ConvergenceState =
  | "observed"
  | "recurring"
  | "corroborated"
  | "potentially-equivalent";

/**

* Levels at which convergence may be observed.
  */
  export type ConvergenceLevel =
  | "lexical"
  | "structural"
  | "functional"
  | "operational"
  | "technological"
  | "contextual";

/**

* Convergence
*
* Represents a recurring pattern between distinct observations.
  */
  export interface Convergence {
  /**

  * Unique convergence identifier.
    */
    readonly id: string;

/**

* Observations from which the convergence emerges.
  */
  readonly observations: Observation[];

/**

* Level at which the convergence was observed.
  */
  readonly level: ConvergenceLevel;

/**

* Evidential state of the convergence.
  */
  readonly state: ConvergenceState;
  }

/**

* Creates a convergence from distinct observations.
  */
  export function createConvergence(
  id: string,
  observations: Observation[],
  level: ConvergenceLevel,
  state: ConvergenceState,
  ): Convergence {
  if (!id.trim()) {
  throw new Error(
  "Convergence id cannot be empty.",
  );
  }

if (observations.length < 2) {
throw new Error(
"Convergence requires at least two observations.",
);
}

const observationIds = observations.map(
(observation) => observation.id,
);

if (new Set(observationIds).size !== observationIds.length) {
throw new Error(
"Convergence observations must be distinct.",
);
}

return {
id,
observations,
level,
state,
};
}
