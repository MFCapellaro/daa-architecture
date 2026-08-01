/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * Actor represents an existing participant
 * of the external ecosystem.
 *
 * An Actor exists independently of DAA.
 * Participation in DAA is a later voluntary
 * relationship.
 */

export type ActorType =
  | "manufacturer"
  | "supplier"
  | "dealer"
  | "service"
  | "operator"
  | "organization"
  | "institution"
  | "community"
  | "training"
  | "other";

export interface ActorIdentity {
  /**
   * Ecosystem actor identifier.
   */
  id: string;

  /**
   * Public identity name.
   */
  name: string;

  /**
   * Ecosystem classification.
   */
  type: ActorType;
}

export interface ActorContext {
  /**
   * Geographic context.
   */
  country?: string;

  region?: string;

  locality?: string;

  latitude?: number;

  longitude?: number;
}

export interface ActorCapabilities {
  /**
   * Existing capabilities recognized
   * within the ecosystem.
   */
  capabilities: string[];
}

export interface Actor {
  identity: ActorIdentity;

  context: ActorContext;

  capabilities: ActorCapabilities;

  /**
   * Reference to discovery origin.
   */
  discoveryRecordId?: string;

  /**
   * Public notes about the actor.
   */
  notes?: string;
}
