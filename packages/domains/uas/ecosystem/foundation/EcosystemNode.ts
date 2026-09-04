export type EcosystemNodeType =
  | "company" | "institution" | "organization" | "professional"
  | "event" | "media" | "research";

export interface GeoLocation {
  city?: string;
  province?: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

export interface Evidence {
  source: string;
  type: "official" | "institutional" | "secondary" | "reported";
  verified: boolean;
  observedAt?: string;
}

export interface EcosystemNode {
  id: string;
  name: string;
  type: EcosystemNodeType;
  identity: { description?: string; status?: "active" | "inactive" | "unknown" };
  location?: GeoLocation;
  layers: string[];
  capabilities: string[];
  brands?: string[];
  presence?: { website?: string; websiteMentionsDrones?: boolean; socialMedia?: boolean };
  evidence: Evidence[];
  status: { verification: "verified" | "partial" | "unverified"; lastChecked?: string };
}
