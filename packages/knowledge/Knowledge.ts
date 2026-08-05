import { Learning } from "./learning/Learning.js";

export interface Knowledge {
  id: string;
  learning: Learning[];
  reusableCapability: string;
}