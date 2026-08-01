/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * DiscoveryRecord represents the observation
 * of an ExternalEntity within the ecosystem.
 */

export type DiscoveryMethod =
  | "manual"
  | "ai"
  | "import"
  | "api"
  | "crawler"
  | "other";

export type DiscoveryStatus =
  | "observed"
  | "classified"
  | "validated"
  | "invited"
  | "archived";

export interface DiscoveryRecord {
  /**
   * Discovery identifier.
   */
  id: string;

  /**
   * Related ExternalEntity identifier.
   */
  entityId: string;

  /**
   * How the entity was discovered.
   */
  method: DiscoveryMethod;

  /**
   * Discovery source identifier.
   */
  sourceId?: string;

  /**
   * Discovery timestamp.
   */
  discoveredAt: Date;

  /**
   * Current discovery lifecycle.
   */
  status: DiscoveryStatus;

  /**
   * Confidence level (0–1).
   */
  confidence?: number;

  /**
   * Classification tags.
   */
  tags?: string[];

  /**
   * Observer notes.
   */
  notes?: string;
}
