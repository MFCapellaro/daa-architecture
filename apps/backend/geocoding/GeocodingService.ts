export interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  constructor(private apiKey: string) {}

  async resolveCoordinates(address: string, city: string, province: string): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      console.warn("[GeocodingService] GOOGLE_MAPS_API_KEY no está configurada.");
      return null;
    }

    const query = `${address}, ${city}, ${province}, Argentina`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = (await response.json()) as {
        status: string;
        results: Array<{ geometry: { location: { lat: number; lng: number } } }>;
      };

      if (data.status !== "OK" || !data.results.length) {
        console.warn(`[Google Geocoding] Sin resultados para: "${query}". Status: ${data.status}`);
        return null;
      }

      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    } catch (error) {
      console.error("[Google Geocoding] Error de red o ejecución:", error);
      return null;
    }
  }
}