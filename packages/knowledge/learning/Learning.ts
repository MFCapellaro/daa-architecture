import { Observation } from "../observation/Observation.js";

export interface Learning {
  id: string;
  observations: Observation[];
  pattern: string;
}