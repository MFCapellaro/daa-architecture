import { describe, expect, it } from "vitest";

import type { Characteristic } from "../src/characteristic/Characteristic.js";

describe("Characteristic", () => {
it("gives semantic identity to an observed property", () => {
const characteristic: Characteristic = {
id: "liquid-payload-capacity",
name: "Liquid Payload Capacity",
value: 40,
unit: "kg",
observationId: "observation-05",
};

expect(characteristic.id).toBe("liquid-payload-capacity");
expect(characteristic.name).toBe("Liquid Payload Capacity");
expect(characteristic.value).toBe(40);
expect(characteristic.unit).toBe("kg");
expect(characteristic.observationId).toBe("observation-05");

});

it("preserves the observed value without normalization", () => {
const characteristic: Characteristic = {
id: "droplet-size",
name: "Droplet Size",
value: "50–500",
unit: "μm",
observationId: "observation-07",
};

expect(characteristic.value).toBe("50–500");
expect(characteristic.unit).toBe("μm");

});

it("keeps semantic identity independent from the raw label", () => {
const characteristic: Characteristic = {
id: "liquid-payload-capacity",
name: "Liquid Payload Capacity",
value: 40,
unit: "kg",
observationId: "observation-05",
};

const rawLabel = "Operating Payload";

expect(characteristic.name).not.toBe(rawLabel);
expect(characteristic.observationId).toBe("observation-05");

});
});
