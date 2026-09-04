/**
 * Actor represents an existing entity
 * within the external ecosystem.
 *
 * An Actor exists independently of DAA.
 * Participation in DAA is established later
 * through Integration and Participant status.
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

export interface Actor {
  identity: ActorIdentity;

  context: ActorContext;

  /**
   * Reference to discovery origin.
   */
  discoveryRecordId?: string;

  /**
   * Public notes about the actor.
   */
  notes?: string;
}
