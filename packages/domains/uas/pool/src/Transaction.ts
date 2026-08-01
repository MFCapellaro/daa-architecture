/**
 * DAA UAS Pool
 * ------------------------------
 * Entity: Transaction
 *
 * A Transaction represents a completed
 * relationship between participants and
 * suppliers originated from a PoolFormation.
 *
 * DAA preserves the relationship context
 * without becoming part of the commercial exchange.
 */

export interface Transaction {
  id: string;

  poolFormationId: string;

  supplierId: string;

  participantIds: string[];

  completedAt: Date;

  status: "completed" | "cancelled";
}