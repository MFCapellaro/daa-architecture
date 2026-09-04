import { describe, expect, it } from "vitest";

import type { NormalizedCharacteristic } from "../src/normalization/CharacteristicNormalization.js";
import {
discernFunction,
type FunctionalDiscernment,
} from "../src/functional/FunctionalDiscernment.js";

describe("FunctionalDiscernment", () => {
it("discerns a function from a normalized characteristic", () => {
const characteristic: NormalizedCharacteristic = {
id: "maximum-spray-flow-rate",
name: "Maximum Spray Flow Rate",
value: 24,
unit: "L/min",
characteristicId: "max-flow-rate-four-sprinklers",
};

const discernment = discernFunction(
  characteristic,
  "Deliver Spray Material",
  "Spraying",
);

expect(discernment.id).toBe(
  "maximum-spray-flow-rate:Deliver Spray Material",
);
expect(discernment.characteristicId).toBe(
  "maximum-spray-flow-rate",
);
expect(discernment.function).toBe(
  "Deliver Spray Material",
);
expect(discernment.context).toBe("Spraying");

});

it("preserves the normalized characteristic as its origin", () => {
const characteristic: NormalizedCharacteristic = {
id: "spread-width",
name: "Spread Width",
value: 8,
unit: "m",
characteristicId: "spread-width",
};

const discernment: FunctionalDiscernment =
  discernFunction(
    characteristic,
    "Distribute Material",
    "Spreading",
  );

expect(discernment.characteristicId).toBe(
  characteristic.id,
);

});
});
