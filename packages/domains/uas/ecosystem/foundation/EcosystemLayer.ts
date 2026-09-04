export interface EcosystemLayer {
  id: string;
  label: string;
  description: string;
  visibleByDefault: boolean;
}

export const ecosystemLayers: EcosystemLayer[] = [
  { id: "dealers", label: "Dealers", description: "Commercial distribution and representation.", visibleByDefault: true },
  { id: "service", label: "Service", description: "Technical and operational services.", visibleByDefault: true },
  { id: "operators", label: "Aplicadores", description: "Operators and agricultural drone services.", visibleByDefault: true },
  { id: "pools", label: "Pools", description: "Collective purchasing and shared resources.", visibleByDefault: false },
  { id: "academia", label: "Academia", description: "Universities, training and research.", visibleByDefault: false },
  { id: "events", label: "Eventos", description: "Exhibitions, congresses and activities.", visibleByDefault: false },
  { id: "media", label: "Medios", description: "Media and communication actors.", visibleByDefault: false },
  { id: "technology", label: "Tecnología", description: "Software, data and technological solutions.", visibleByDefault: false },
  { id: "public", label: "Público", description: "Public institutions and regulatory actors.", visibleByDefault: false },
];
