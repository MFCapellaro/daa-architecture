// Module.ts
// Defines configurable capabilities that can participate in a solution.

export type ModuleCategory =
  | "application"
  | "sensing"
  | "energy"
  | "transport"
  | "support"
  | "communication"
  | "custom";

export type ModuleStatus =
  | "available"
  | "required"
  | "optional"
  | "future";

export interface ModuleCapability {
  name: string;

  description?: string;

  parameters?: Record<string, unknown>;
}

export interface ModuleCompatibility {
  compatibleNodes?: string[];

  requirements?: string[];

  limitations?: string[];
}

export interface Module {
  id: string;

  name: string;

  category: ModuleCategory;

  status?: ModuleStatus;

  capability: ModuleCapability;

  compatibility?: ModuleCompatibility;

  technologyDNA?: string;
}