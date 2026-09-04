/**
 * Characteristic Normalization
 *
 * Establishes a comparable semantic identity for a characteristic.
 *
 * Normalization does not alter the originating evidence.
 * It creates a normalized representation while preserving traceability.
 */

import type { Characteristic } from "../characteristic/Characteristic.js";

export interface NormalizedCharacteristic {
  /**
   * Unique normalized characteristic identifier.
   */
  readonly id: string;

  /**
   * Normalized semantic name.
   */
  readonly name: string;

  /**
   * Value preserved from the characteristic.
   */
  readonly value: unknown;

  /**
   * Normalized unit, when applicable.
   */
  readonly unit?: string;

  /**
   * Characteristic from which this normalized representation emerged.
   */
  readonly characteristicId: string;
}

/**
 * Creates a normalized characteristic from an existing characteristic.
 *
 * Normalization preserves the original value and unit unless an explicit
 * normalization rule is later introduced.
 */
export function normalizeCharacteristic(
  characteristic: Characteristic,
  normalizedId: string,
  normalizedName: string,
): NormalizedCharacteristic {
  return {
    id: normalizedId,
    name: normalizedName,
    value: characteristic.value,
    unit: characteristic.unit,
    characteristicId: characteristic.id,
  };
}