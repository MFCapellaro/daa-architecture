/**
 * Action Repository
 *
 * Responsibility:
 *
 *   Define persistence operations for Action records.
 *
 * Actions represent historical facts.
 * They are append-only records and are not
 * updated after registration.
 */

import type { Action } from "./Action.js";

export interface ActionRepository {
  save(action: Action): Promise<void>;
}