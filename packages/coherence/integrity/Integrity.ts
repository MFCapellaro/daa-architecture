/**
 * DAA Coherence
 * ------------------------------
 * Integrity
 *
 * Integrity emerges when identity
 * is preserved through balanced
 * relationships.
 */

import type { Identity } from "../identity/Identity.js";
import type { Balance } from "../balance/Balance.js";

export interface Integrity {

  readonly identity: Identity;

  readonly balance: Balance;

  readonly coherent: boolean;

}


export const Integrity = {

  of(
    identity: Identity,
    balance: Balance
  ): Integrity {

    return {
      identity,
      balance,
      coherent:
        identity.continuity &&
        balance.relationships.length > 0
    };

  }

} as const;