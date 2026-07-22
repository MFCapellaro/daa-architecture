// TechnologyDNA.ts
// Defines the characteristic expression of a technology within an adaptive system.

export type TechnologyApproach =
  | "integrated"
  | "modular"
  | "specialized"
  | "open"
  | "custom";

export interface TechnologyAttributes {
  scalability?: number;

  adaptability?: number;

  integrationLevel?: number;

  automationLevel?: number;

  evolutionPotential?: number;
}

export interface TechnologyPrinciples {
  architecture?: string[];

  philosophy?: string;

  designApproach?: string;
}

export interface TechnologyDNA {
  id: string;

  name: string;

  approach: TechnologyApproach;

  principles?: TechnologyPrinciples;

  attributes?: TechnologyAttributes;

  capabilities?: string[];

  relationships?: string[];
}