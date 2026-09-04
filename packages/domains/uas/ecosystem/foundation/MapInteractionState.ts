export interface MapInteractionState {
  activeLayers: string[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  // Relationships remain latent until explicitly revealed.
  relationshipsRevealed: boolean;
  viewport: { zoom: number; center: { lat: number; lng: number } };
}
