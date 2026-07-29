/**
 * DAA Domain: UAS
 * ------------------------------
 *
 * Operation represents a UAV
 * activity within a mission context.
 */

import type { Mission } from "../../../configuration/entities/Mission.js";

export interface Operation {

  readonly mission: Mission;

  readonly status:
    | "planned"
    | "active"
    | "completed";

}