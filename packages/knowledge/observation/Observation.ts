// knowledge/observation/Observation.ts

import { Experience } from "../experience/Experience.js";

export interface Observation {
  id: string;
  source: Experience;
  insight: string;
}