// Brand.ts
// Defines a technology provider participating within an adaptive ecosystem.

export interface BrandIdentity {
  name: string;

  country?: string;

  website?: string;

  description?: string;
}

export interface BrandCapabilities {
  technologyAreas?: string[];

  supportedModules?: string[];

  supportedDomains?: string[];
}

export interface BrandRelationship {
  partners?: string[];

  ecosystemConnections?: string[];

  distributionNetwork?: string[];
}

export interface Brand {
  id: string;

  identity: BrandIdentity;

  capabilities?: BrandCapabilities;

  technologyDNA?: string;

  relationships?: BrandRelationship;
}