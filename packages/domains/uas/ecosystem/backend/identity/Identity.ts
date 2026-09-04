/**
 * DRONSAIR ecosystem identity.
 *
 * Responsibility:
 *
 *   Determine the identity state of an ecosystem record.
 *
 * Design principles:
 *
 *   - identity precedes merge;
 *   - preserve ambiguity;
 *   - never merge entities;
 *   - never discard source records;
 *   - never infer identity from a single weak signal.
 *
 * Identity does not:
 *
 *   - merge records;
 *   - publish nodes;
 *   - geocode entities;
 *   - enrich directory information.
 */

export type IdentityStatus =
  | "unknown"
  | "candidate"
  | "confirmed"

export interface IdentityInput {
  id: string
  name: string
  type: string
  source?: string
  website?: string | null
}

export interface IdentityResult {
  status: IdentityStatus

  /**
   * Existing canonical entity, when identity
   * has already been established.
   */
  canonicalId?: string

  /**
   * Possible existing identities requiring review.
   */
  candidates: string[]
}

export interface IdentityResolver {
  resolve(
    input: IdentityInput,
  ): Promise<IdentityResult>
}