/**
 * DAA UAS Pool
 * ------------------------------
 * Entity: Supplier
 *
 * A Supplier represents an organization
 * capable of providing structured collective
 * offers and relationship continuity.
 *
 * Supplier identity expands through
 * capabilities, commitments, and interactions.
 */

export interface Supplier {
  id: string;

  name: string;

  capabilities: string[];

  location?: string;
}