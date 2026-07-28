// evolution/possibility/Possibility.ts

import { Potential } from "../potential/Potential.js";

export interface Possibility {
  id: string;
  source: Potential;
  conditions: string[];
}