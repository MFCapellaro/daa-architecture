export interface SemanticData {
  actorId: string;
  notes?: string;
  structure?: Record<string, any>;
  tags?: string[];
  certifications?: string[];
}

export interface Actor {
  id: string;
  name: string;
  type: 'company' | 'person' | 'institution';
  layers: string[];
  capabilities: string;
  contact: boolean;
  geo: boolean;
  presence: boolean;
  status: 'PUBLIC' | 'WAIT' | 'HOLD' | 'DUPLICADO';
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  latitude?: number | null;
  longitude?: number | null;
  semanticData?: SemanticData | null;
}