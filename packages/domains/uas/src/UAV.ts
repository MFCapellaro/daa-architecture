/**
 * DAA Domain: UAS
 * ------------------------------
 *
 * UAV represents an operational
 * unmanned aerial system.
 */

import type { UAVSystem } from "../../../configuration/schemas/UAVSchema.js";

export interface UAV {

  readonly system: UAVSystem;

  readonly operational: boolean;

}