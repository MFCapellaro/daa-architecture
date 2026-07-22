// Mission.ts
// Defines the purpose that guides a configuration.

export type MissionPriority =
  | "efficiency"
  | "precision"
  | "capacity"
  | "cost"
  | "sustainability"
  | "scalability";

export type MissionType =
  | "application"
  | "mapping"
  | "inspection"
  | "monitoring"
  | "transport"
  | "custom";

export interface OperationalContext {
  location?: string;

  environmentalConditions?: {
    wind?: number;
    temperature?: number;
    terrain?: string;
    weather?: string;
  };

  additionalInformation?: Record<string, unknown>;
}

export interface MissionRequirements {
  requiredCapabilities: string[];

  performanceTargets?: {
    area?: number;
    productivity?: number;
    precision?: number;
  };

  constraints?: {
    maximumWeight?: number;
    maximumCost?: number;
    operationalLimits?: string[];
  };
}

export interface Mission {
  id: string;

  name: string;

  type: MissionType;

  objective: string;

  priority?: MissionPriority[];

  context?: OperationalContext;

  requirements: MissionRequirements;
}