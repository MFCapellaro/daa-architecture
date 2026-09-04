/**

* Functional Discernment
*
* Represents a function discerned from a normalized characteristic
* within an explicit product context.
*
* Functional discernment does not invent capability.
* It establishes the functional meaning revealed by evidence.
  */

import type { NormalizedCharacteristic } from "../normalization/CharacteristicNormalization.js";

export interface FunctionalDiscernment {
/**

* Unique discernment identifier.
  */
  readonly id: string;

/**

* Normalized characteristic from which the function is discerned.
  */
  readonly characteristicId: string;

/**

* Functional identity revealed by the characteristic.
  */
  readonly function: string;

/**

* Product or operational context in which the function applies.
  */
  readonly context: string;
  }

export function discernFunction(
characteristic: NormalizedCharacteristic,
functionName: string,
context: string,
): FunctionalDiscernment {
return {
id: `${characteristic.id}:${functionName}`,
characteristicId: characteristic.id,
function: functionName,
context,
};
}
