/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * DiscoverySource identifies the origin of
 * ecosystem information.
 */

export type DiscoverySourceType =
  | "manual"
  | "website"
  | "directory"
  | "api"
  | "social"
  | "partner"
  | "government"
  | "event"
  | "other";

export interface DiscoverySource {
  /**
   * Source identifier.
   */
  id: string;

  /**
   * Human-readable name.
   */
  name: string;

  /**
   * Source classification.
   */
  type: DiscoverySourceType;

  /**
   * Reference URL or endpoint.
   */
  reference?: string;

  /**
   * Source description.
   */
  description?: string;

  /**
   * Indicates whether the source is trusted.
   */
  trusted?: boolean;
}