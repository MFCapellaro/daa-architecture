// Configuration.ts
// Defines a generated functional solution from system relationships.

export type ConfigurationStatus =
  | "draft"
  | "evaluated"
  | "recommended"
  | "active";

export interface ConfigurationMetrics {
  totalWeight?: number;

  totalCost?: number;

  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };

  capacity?: number;

  productivity?: number;

  energyRequirement?: number;

  operationalEfficiency?: number;
}

export interface ConfigurationRecommendation {
  score?: number;

  reasons?: string[];

  improvements?: string[];
}

export interface Configuration {
  id: string;

  name: string;

  status: ConfigurationStatus;

  mission: string;

  nodes: string[];

  modules: string[];

  technologyDNA?: string[];

  constraints?: string[];

  metrics?: ConfigurationMetrics;

  recommendation?: ConfigurationRecommendation;
}