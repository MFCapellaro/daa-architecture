/**
 * DRONSAIR ecosystem merge.
 *
 * Responsibility:
 *
 *   Consolidate source records that have been identified
 *   as representing the same entity.
 *
 * Design principles:
 *
 *   - preserve every source record;
 *   - preserve provenance;
 *   - combine compatible information;
 *   - preserve distinct layers;
 *   - never invent data;
 *   - never decide identity.
 *
 * Merge does not:
 *
 *   - resolve identity;
 *   - publish entities;
 *   - enrich directory data;
 *   - geocode locations.
 */

export interface MergeInput<T> {
  canonicalId: string
  sources: T[]
}

export interface MergeResult<T> {
  canonicalId: string
  node: T
  sourceIds: string[]
}

export interface Merger<T> {
  merge(
    input: MergeInput<T>,
  ): Promise<MergeResult<T>>
}