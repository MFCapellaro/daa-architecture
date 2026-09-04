import { describe, expect, it } from "vitest";

import type { Characteristic } from "../src/characteristic/Characteristic.js";
import {
  normalizeCharacteristic,
  type NormalizedCharacteristic,
} from "../src/normalization/CharacteristicNormalization.js";

describe("CharacteristicNormalization", () => {
  it("creates a normalized semantic identity from a characteristic", () => {
    const characteristic: Characteristic = {
      id: "liquid-payload-capacity",
      name: "Liquid Payload Capacity",
      value: 40,
      unit: "kg",
      observationId: "observation-05",
    };

    const normalized = normalizeCharacteristic(
      characteristic,
      "payload-capacity",
      "Payload Capacity",
    );

    expect(normalized.id).toBe("payload-capacity");
    expect(normalized.name).toBe("Payload Capacity");
    expect(normalized.value).toBe(40);
    expect(normalized.unit).toBe("kg");
    expect(normalized.characteristicId).toBe(
      "liquid-payload-capacity",
    );
  });

  it("does not change the originating value during normalization", () => {
    const characteristic: Characteristic = {
      id: "droplet-size",
      name: "Droplet Size",
      value: "50–500",
      unit: "μm",
      observationId: "observation-07",
    };

    const normalized = normalizeCharacteristic(
      characteristic,
      "droplet-size",
      "Droplet Size",
    );

    expect(normalized.value).toBe("50–500");
    expect(normalized.unit).toBe("μm");
  });

  it("preserves traceability to the characteristic", () => {
    const characteristic: Characteristic = {
      id: "spray-flow-rate",
      name: "Max Flow Rate",
      value: 16,
      unit: "L/min",
      observationId: "observation-08",
    };

    const normalized: NormalizedCharacteristic =
      normalizeCharacteristic(
        characteristic,
        "maximum-spray-flow-rate",
        "Maximum Spray Flow Rate",
      );

    expect(normalized.characteristicId).toBe(
      characteristic.id,
    );
  });
});