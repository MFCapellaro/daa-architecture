/**
 * DAA UAS Pool
 * ------------------------------
 * Entity: Participant
 *
 * A Participant represents a registered
 * system member who expresses interest
 * in collective opportunities.
 *
 * Identity expands progressively
 * through participation and relationships.
 */

export interface Participant {
  id: string;

  name: string;

  location?: string;

  interests?: string[];
}