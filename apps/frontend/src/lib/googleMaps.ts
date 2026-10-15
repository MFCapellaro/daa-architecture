/// <reference types="google.maps" />
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

export interface GoogleMapsLibraries {
  maps: google.maps.MapsLibrary;
  marker: google.maps.MarkerLibrary;
  geocoding: google.maps.GeocodingLibrary;
}

let librariesPromise: Promise<GoogleMapsLibraries> | undefined;

export const loadGoogleMaps = (): Promise<GoogleMapsLibraries> => {
  if (librariesPromise) return librariesPromise;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    || import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY;
  if (!key) return Promise.reject(new Error('Falta configurar la clave de Google Maps.'));

  setOptions({ key, v: 'weekly' });

  librariesPromise = Promise.all([
    importLibrary('maps'),
    importLibrary('marker'),
    importLibrary('geocoding'),
  ]).then(([maps, marker, geocoding]) => ({
    maps,
    marker,
    geocoding,
  })).catch((error: unknown) => {
    librariesPromise = undefined;
    throw error;
  });

  return librariesPromise;
};
