/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * ExternalEntity represents an existing entity recognized
 * within the UAS ecosystem before any DAA relationship exists.
 *
 * An ExternalEntity is observed, not incorporated.
 */

export type ExternalEntityType =
  | "manufacturer"
  | "supplier"
  | "dealer"
  | "service"
  | "organization"
  | "operator"
  | "training"
  | "community"
  | "government"
  | "other";

export interface ExternalEntityIdentity {
  /**
   * Stable external identifier.
   */
  id: string;

  /**
   * Public name.
   */
  name: string;

  /**
   * Ecosystem classification.
   */
  type: ExternalEntityType;
}

export interface ExternalEntityContext {
  /**
   * Country.
   */
  country?: string;

  /**
   * State / Province.
   */
  region?: string;

  /**
   * City.
   */
  locality?: string;

  /**
   * Geographic coordinates.
   */
  latitude?: number;

  longitude?: number;
}

export interface ExternalEntityCapabilities {
  /**
   * Products, services or capabilities
   * publicly associated with the entity.
   */
  capabilities: string[];
}

export interface ExternalEntityMetadata {
  /**
   * Public website.
   */
  website?: string;

  /**
   * Public contact email.
   */
  email?: string;

  /**
   * Public phone.
   */
  phone?: string;

  /**
   * Additional public notes.
   */
  notes?: string;
}

export interface ExternalEntity {
  identity: ExternalEntityIdentity;

  context: ExternalEntityContext;

  capabilities: ExternalEntityCapabilities;

  metadata?: ExternalEntityMetadata;
}
