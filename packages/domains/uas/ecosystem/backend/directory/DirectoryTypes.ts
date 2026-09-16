export type DirectoryNodeStatus = "WAIT" | "HOLD" | "PUBLIC";

export interface GeoLocationData {
  address: string;
  city: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  status: "PENDING" | "RESOLVED" | "FAILED";
}

export interface DirectoryItemSummaryDTO {
  id: string;
  name: string;
  type: string;
  layers: string[];
  capabilities: string[];
  contactAvailable: boolean;
  geoAvailable: boolean;
  presenceAvailable: boolean;
  status: DirectoryNodeStatus;
  isHold: boolean;
  isWait: boolean;
  isPublic: boolean;
}

export interface DirectoryItemDetailDTO extends DirectoryItemSummaryDTO {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  geolocation: GeoLocationData;
  website: string | null;
  websiteStatus: boolean;
  socialNetworks: boolean;
  semanticNotes?: string;
}

export interface DirectoryQueryDTO {
  category?: string;
  layer?: string;
  status?: DirectoryNodeStatus;
  page?: number;
  limit?: number;
  search?: string;
}

export interface DirectoryReviewSummaryDTO {
  totalRequiringAttention: number;
  waitingCount: number;
  holdCount: number;
  duplicatesCount: number;
}