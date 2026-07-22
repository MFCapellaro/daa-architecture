// multi-brand-comparison.ts
// Tests multiple technology expressions for the same mission.

import type { Mission } from "../packages/configuration/entities/Mission";
import type { Brand } from "../packages/configuration/entities/Brand";
import type { TechnologyDNA } from "../packages/configuration/dna/TechnologyDNA";
import type { UAVSystem } from "../packages/configuration/schemas/UAVSchema";
import type { Configuration } from "../packages/configuration/entities/Configuration";


const mission: Mission = {
  id: "precision-agriculture-application",

  name: "Precision Agricultural Application",

  type: "application",

  objective:
    "Apply agricultural treatments efficiently according to field conditions.",

  priority: [
    "efficiency",
    "precision",
    "scalability"
  ],

  requirements: {
    requiredCapabilities: [
      "liquid_application",
      "solid_application",
      "rtk_navigation"
    ],

    performanceTargets: {
      precision: 95
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


const xagDNA: TechnologyDNA = {
  id: "xag-agriculture-dna",

  name: "XAG Agricultural Ecosystem",

  approach: "modular",

  attributes: {
    integrationLevel: 8,
    automationLevel: 9,
    scalability: 9
  },

  capabilities: [
    "precision_application",
    "autonomous_operation",
    "modular_configuration"
  ]
};


const topxgunDNA: TechnologyDNA = {
  id: "topxgun-agriculture-dna",

  name: "TopXGun Agricultural Ecosystem",

  approach: "specialized",

  attributes: {
    integrationLevel: 8,
    automationLevel: 8,
    scalability: 8
  },

  capabilities: [
    "precision_application",
    "agricultural_operation"
  ]
};


const brands: Brand[] = [
  {
    id: "dji",

    identity: {
      name: "DJI",
      country: "China"
    },

    technologyDNA: djiDNA.id
  },

  {
    id: "xag",

    identity: {
      name: "XAG",
      country: "China"
    },

    technologyDNA: xagDNA.id
  },

  {
    id: "topxgun",

    identity: {
      name: "TopXGun",
      country: "China"
    },

    technologyDNA: topxgunDNA.id
  }
];


const uavs: UAVSystem[] = [
  {
    id: "dji-agras-t50",

    identity: {
      manufacturer: "DJI",
      model: "AGRAS T50",
      category: "agricultural"
    },

    modules: [
      "liquid_application",
      "solid_application"
    ],

    technologyDNA: djiDNA.id
  },

  {
    id: "xag-p150",

    identity: {
      manufacturer: "XAG",
      model: "P150",
      category: "agricultural"
    },

    modules: [
      "liquid_application",
      "solid_application"
    ],

    technologyDNA: xagDNA.id
  },

  {
    id: "topxgun-fp600",

    identity: {
      manufacturer: "TopXGun",
      model: "FP600",
      category: "agricultural"
    },

    modules: [
      "liquid_application",
      "solid_application"
    ],

    technologyDNA: topxgunDNA.id
  }
];


const configurations: Configuration[] = uavs.map((uav) => ({
  id: `${uav.id}-configuration`,

  name: `${uav.identity.manufacturer} ${uav.identity.model} Solution`,

  status: "evaluated",

  mission: mission.id,

  nodes: [
    uav.id
  ],

  modules: [
    ...(uav.modules ?? [])
  ],

  technologyDNA: [
    uav.technologyDNA ?? ""
  ]
}));


export {
  mission,
  brands,
  djiDNA,
  xagDNA,
  topxgunDNA,
  uavs,
  configurations
};