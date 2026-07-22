// UAVSchema.ts
// Defines how a UAV system participates within a configurable solution.

export type UAVCategory =
  | "agricultural"
  | "mapping"
  | "inspection"
  | "transport"
  | "custom";

export interface UAVIdentity {
  manufacturer: string;

  model: string;

  category: UAVCategory;

  generation?: string;
}

export interface UAVArchitecture {
  platformType?: string;

  configurationPhilosophy?: string;

  integrationLevel?: string;

  modularity?: string;
}

export interface UAVPerformance {
  weight?: number;

  maximumTakeoffWeight?: number;

  flightTime?: number;

  flightRadius?: number;

  coverageRate?: number;
}

export interface UAVPayload {
  liquid?: {
    capacity?: number;

    flowRate?: number;
  };

  solid?: {
    capacity?: number;

    materialRange?: string;
  };
}

export interface UAVSystem {
  id: string;

  identity: UAVIdentity;

  architecture?: UAVArchitecture;

  modules?: string[];

  payload?: UAVPayload;

  performance?: UAVPerformance;

  energySystem?: string;

  sensingCapabilities?: string[];

  technologyDNA?: string;

  fieldKnowledge?: string[];
}