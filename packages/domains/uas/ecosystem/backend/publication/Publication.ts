/**
 * DRONSAIR ecosystem publication.
 *
 * Responsibility:
 *
 *   Materialize the visibility state of an approved record.
 *
 * Design principles:
 *
 *   - publication is explicit;
 *   - publication follows review;
 *   - publication does not alter semantic identity;
 *   - unpublished data remains available to the backend;
 *   - temporal activation is decided at publication time;
 *   - publication preserves source records.
 *
 * Publication does not:
 *
 *   - resolve identity;
 *   - detect duplicates;
 *   - resolve review decisions;
 *   - merge entities;
 *   - enrich directory information;
 *   - modify source evidence.
 */

export type PublicationStatus =
  | "programmed"
  | "published"
  | "archived"

export interface PublicationInput<T = unknown> {
  value: T
}

export interface PublicationResult<T = unknown> {
  value: T
  status: PublicationStatus
  published: boolean
  publicationDate?: Date
}

export interface Publisher<T = unknown> {
  publish(
    input: PublicationInput<T>,
  ): Promise<PublicationResult<T>>
}
