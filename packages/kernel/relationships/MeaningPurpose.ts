/**
 * DAA Kernel
 * ------------------------------
 * Relationship:
 * Meaning gives Purpose.
 */

import { Meaning } from "../concepts/Meaning.js";
import { Purpose } from "../concepts/Purpose.js";

import { KernelRelationship } from "../KernelRelationship.js";
import { Verbs } from "../Verb.js";

export const MeaningPurpose = KernelRelationship.of(
  Meaning,
  Verbs.Gives,
  Purpose
);