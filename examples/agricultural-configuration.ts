// agricultural-configuration.ts
// First integration example of a functional configuration.

import type { Mission } from "../packages/configuration/entities/Mission";
import type { Module } from "../packages/configuration/entities/Module";
import type { Brand } from "../packages/configuration/entities/Brand";
import type { TechnologyDNA } from "../packages/configuration/dna/TechnologyDNA";
import type { UAVSystem } from "../packages/configuration/schemas/UAVSchema";
import type { Configuration } from "../packages/configuration/entities/Configuration";


const mission: Mission = {
  id: "precision-spraying",

  name: "Precision Agricultural Application",

  type: "application",

  objective:
    "Apply agricultural treatment according to field conditions.",

  priority: [
    "efficiency",
    "precision"
  ],

  context: {
    environmentalConditions: {
      wind: 3,
      temperature: 25,
      terrain: "flat",
      weather: "clear"
    }
  },

  requirements: {
    requiredCapabilities: [
      "liquid_application",
      "rtk_navigation",
      "terrain_following"
    ],

    performanceTargets: {
      precision: 95
    }
  }
};


const liquidApplicationModule: Module = {
  id: "liquid-application",

  name: "Liquid Application System",

  category: "application",

  status: "required",

  capability: {
    name: "Precision spraying",
    parameters: {
      capacity: "40L"
    }
  }
};


const djiDNA: TechnologyDNA = {
  id: "dji-agras-dna",

  name: "DJI Agricultural Ecosystem",

  approach: "integrated",

  attributes: {
    integrationLevel: 9,
    automationLevel: 9,
    scalability: 8
  },

  capabilities: [
    "precision_application",
    "autonomous_operation"
  ]
};


const djiBrand: Brand = {
  id: "dji",

  identity: {
    name: "DJI",
    country: "China"
  },

  capabilities: {
    technologyAreas: [
      "agricultural UAV"
    ],

    supportedModules: [
      "liquid_application"
    ]
  },

  technologyDNA: djiDNA.id
};


const agrasT50: UAVSystem = {
  id: "dji-agras-t50",

  identity: {
    manufacturer: djiBrand.identity.name,
    model: "AGRAS T50",
    category: "agricultural"
  },

  modules: [
    liquidApplicationModule.id
  ],

  payload: {
    liquid: {
      capacity: 40
    }
  },

  technologyDNA: djiDNA.id
};


const configuration: Configuration = {
  id: "agtech-unit-001",

  name: "Precision Spraying Unit",

  status: "recommended",

  mission: mission.id,

  nodes: [
    agrasT50.id
  ],

  modules: [
    liquidApplicationModule.id
  ],

  technologyDNA: [
    djiDNA.id
  ],

  metrics: {
    capacity: 40
  }
};


export {
  mission,
  liquidApplicationModule,
  djiDNA,
  djiBrand,
  agrasT50,
  configuration
};