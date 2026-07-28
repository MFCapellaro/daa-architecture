// evolution/emergence/Emergence.ts

import { Potential } from "../potential/Potential.js";

export interface Emergence {
  id: string;
  origin: string;
  newPotential: Potential;
}