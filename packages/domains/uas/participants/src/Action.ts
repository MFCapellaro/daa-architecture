/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * An Action records something performed
 * by a Participant within DAA.
 *
 * The Participant reference is essential:
 * it establishes authorship and provides
 * the evidence from which a trajectory
 * may later be constructed.
 */

export type ActionType =
  | "submit_actor"
  | "submit_activity"
  | "submit_query"
  | "submit_problem"
  | "submit_solution"
  | "request_pool";

export type ActionTargetType =
  | "actor"
  | "activity"
  | "query"
  | "problem"
  | "solution"
  | "pool";

export interface Action {
  /**
   * Action identifier.
   */
  id: string;

  /**
   * Participant who performed the action.
   */
  participantId: string;

  /**
   * Type of action performed.
   */
  type: ActionType;

  /**
   * Type of object affected by the action.
   */
  targetType: ActionTargetType;

  /**
   * Identifier of the affected object.
   */
  targetId: string;

  /**
   * Date and time on which the action occurred.
   */
  occurredAt: Date;
}