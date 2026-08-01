/**
 * DAA UAS Pool
 * ------------------------------
 * Entity: PoolFormation
 *
 * A PoolFormation represents the emergence
 * of a collective purchasing condition from
 * individual participant interests.
 *
 * Formation expresses the transition from
 * distributed demand into collective capability.
 */

export interface PoolFormation {
  id: string;

  poolOfferId: string;

  participantIds: string[];

  targetUnits: number;

  currentUnits: number;

  status: "forming" | "completed" | "expired";
}