/**

* Normalization
*
* Applies an explicit normalization rule to a characteristic.
*
* The original characteristic is never modified.
* Normalization establishes semantic identity while preserving
* the characteristic as the traceable origin.
  */

import type { Characteristic } from "../characteristic/Characteristic.js";
import type { NormalizedCharacteristic } from "./CharacteristicNormalization.js";
import type { NormalizationRule } from "./NormalizationRule.js";

export function normalize(
characteristic: Characteristic,
rule: NormalizationRule,
): NormalizedCharacteristic {
if (!rule.characteristicIds.includes(characteristic.id)) {
throw new Error(
`Characteristic "${characteristic.id}" is not applicable to normalization rule "${rule.id}".`,
);
}

return {
id: rule.normalizedId,
name: rule.normalizedName,
value: characteristic.value,
unit: characteristic.unit,
characteristicId: characteristic.id,
};
}
