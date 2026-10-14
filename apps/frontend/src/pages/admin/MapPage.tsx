/// <reference types="google.maps" />
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { DEFAULT_CATEGORIES, type Category } from '../../types/category';

interface ActorRelationship {
  targetId: string;
  type: string;
}

export interface Actor {
  id: string;
  name: string;
  categoryLabel?: string;
  layers?: string[];
  isPublic?: boolean;
  relationships?: ActorRelationship[];
  description?: string;
  contact?: {
    email: string | null;
    phone: string | null;
    city: string | null;
    province: string | null;
  };
  location?: {
    city: string | null;
    province: string | null;
    coordinates?: {
      latitude: number | string | null;
      longitude: number | string | null;
    } | null;
  };
  geolocation?: {
    latitude: number | string | null;
    longitude: number | string | null;
  };
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY || '';
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID';

const extractCoordinates = (actor: Actor): { lat: number; lng: number } | null => {
  const rawLat = actor.geolocation?.latitude ?? actor.location?.coordinates?.latitude;
  const rawLng = actor.geolocation?.longitude ?? actor.location?.coordinates?.longitude;

  if (rawLat == null || rawLng == null) return null;

  const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
  const lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng;

  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

  return { lat, lng };
};

export const MapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerLibraryRef = useRef<typeof google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [actors, setActors] = useState<Actor[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<Record<string, boolean>>({});

  // Capturar errores de autenticación de Google Maps a nivel global
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      setApiError('Error de autenticación con Google Maps (API Key inválida o sin permisos para localhost).');
    };
  }, []);

  // 1. Cargar el SDK de Google Maps
  useEffect(() => {
    let isActive = true;
    let script: HTMLScriptElement | null = null;

    const initMap = async () => {
      if (!mapContainerRef.current || !window.google || !window.google.maps) return;

      try {
        const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
        if (!isActive || !mapContainerRef.current || mapInstanceRef.current) return;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: -38.416097, lng: -63.616672 },
          zoom: 4,
          mapId: MAP_ID,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          disableDefaultUI: true,
          zoomControl: true,
        });

        markerLibraryRef.current = AdvancedMarkerElement;
        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        setIsMapLoaded(true);
      } catch (e) {
        console.error('Error al inicializar el mapa:', e);
        if (isActive) setApiError('No se pudo inicializar la instancia del mapa.');
      }
    };

    if (window.google && window.google.maps) {
      void initMap();
    } else {
      const scriptId = 'google-maps-js-sdk';
      script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener('load', initMap);
    }

    return () => {
      isActive = false;
      script?.removeEventListener('load', initMap);
    };
  }, []);

  // 2. Fetch de datos
  useEffect(() => {
    const fetchActors = async () => {
      try {
        const [actorsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/actors'),
          fetch('/api/categories'),
        ]);
        if (!actorsResponse.ok) throw new Error(`No se pudieron cargar los actores (HTTP ${actorsResponse.status}).`);
        if (!categoriesResponse.ok) throw new Error(`No se pudieron cargar las categorías (HTTP ${categoriesResponse.status}).`);
        const [data, loadedCategories]: [Actor[], Category[]] = await Promise.all([
          actorsResponse.json(),
          categoriesResponse.json(),
        ]);
        setActors(data);
        setCategories(loadedCategories);
        setSelectedLayers(Object.fromEntries(
          loadedCategories.map((category) => [category.id, category.visibleByDefault !== false])
        ));
      } catch (err) {
        console.error('Error al cargar actores:', err);
        setApiError(err instanceof Error ? err.message : 'No se pudieron cargar los datos del mapa.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchActors();
  }, []);

  // 3. Filtrar actores geolocalizados
  const geolocatedActors = useMemo(() => {
    return actors
      .map((actor) => ({ actor, coords: extractCoordinates(actor) }))
      .filter((item): item is { actor: Actor; coords: { lat: number; lng: number } } => item.coords !== null);
  }, [actors]);

  const visibleActors = useMemo(() => {
    const isLayerVisible = (layerId: string): boolean => {
      const visited = new Set<string>();
      let category = categories.find((entry) => entry.id === layerId);
      while (category && !visited.has(category.id)) {
        visited.add(category.id);
        if (!(selectedLayers[category.id] ?? category.visibleByDefault !== false)) return false;
        const parentId = category.parentId;
        category = parentId ? categories.find((entry) => entry.id === parentId) : undefined;
      }
      return selectedLayers[layerId] ?? true;
    };

    return geolocatedActors.filter(({ actor }) => {
      if (actor.isPublic === false) return false;
      const actorLayers = actor.layers?.length ? actor.layers : actor.categoryLabel ? [actor.categoryLabel] : [];
      return actorLayers.length === 0 || actorLayers.some(isLayerVisible);
    });
  }, [categories, geolocatedActors, selectedLayers]);

  // 4. Actualizar marcadores
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !markerLibraryRef.current || !window.google) return;

    const map = mapInstanceRef.current;
    const AdvancedMarkerElement = markerLibraryRef.current;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    const markerContents: HTMLDivElement[] = [];
    const relationships: google.maps.Polyline[] = [];
    const bounds = new google.maps.LatLngBounds();
    const visibleById = new Map(visibleActors.map(({ actor, coords }) => [actor.id, { actor, coords }]));

    visibleActors.forEach(({ actor, coords }) => {
      bounds.extend(coords);
      const markerColor = categories.find((category) =>
        actor.layers?.includes(category.id)
      )?.color ?? '#4ade80';

      const markerContent = document.createElement('div');
      markerContent.className = 'actor-map-marker';
      markerContent.style.setProperty('--marker-color', markerColor);
      const pulse = document.createElement('span');
      pulse.className = 'actor-map-marker__pulse';
      const dot = document.createElement('span');
      dot.className = 'actor-map-marker__dot';
      markerContent.append(pulse, dot);

      const marker = new AdvancedMarkerElement({
        position: coords,
        map,
        title: actor.name,
        gmpClickable: true,
        zIndex: 2,
        anchorLeft: '-50%',
        anchorTop: '-50%',
      });
      marker.append(markerContent);
      markers.push(marker);
      markerContents.push(markerContent);

      const cityStr = actor.location?.city || actor.contact?.city || '';
      const provStr = actor.location?.province || actor.contact?.province || '';

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 8px; max-width: 240px; color: #0f172a;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #2563eb; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">
            ${actor.categoryLabel || 'Entidad'}
          </span>
          <h4 style="margin: 6px 0 4px 0; font-size: 14px; font-weight: 700;">${actor.name}</h4>
          ${provStr ? `<p style="margin: 0; font-size: 12px; color: #64748b;">📍 ${cityStr ? cityStr + ', ' : ''}${provStr}</p>` : ''}
          ${actor.contact?.phone ? `<p style="margin: 4px 0 0 0; font-size: 12px;">📞 ${actor.contact.phone}</p>` : ''}
          ${actor.contact?.email ? `<p style="margin: 2px 0 0 0; font-size: 12px;">✉️ ${actor.contact.email}</p>` : ''}
        </div>
      `;

      marker.addEventListener('gmp-click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(popupContent);
          infoWindowRef.current.open({ map, anchor: marker });
        }
      });
    });

    const updateMarkerScale = () => {
      const zoom = map.getZoom() ?? 4;
      const scale = Math.min(1.65, Math.max(0.75, 0.8 + (zoom - 4) * 0.1));
      markerContents.forEach((content) => content.style.setProperty('--zoom-scale', String(scale)));
    };
    const zoomListener = map.addListener('zoom_changed', updateMarkerScale);
    updateMarkerScale();

    const drawnRelationships = new Set<string>();
    visibleActors.forEach(({ actor }) => {
      for (const relationship of actor.relationships ?? []) {
        const target = visibleById.get(relationship.targetId);
        if (!target || target.actor.id === actor.id) continue;

        const isChildRelation = relationship.type === 'child_of';
        const start = isChildRelation ? target : visibleById.get(actor.id);
        const end = isChildRelation ? visibleById.get(actor.id) : target;
        if (!start || !end) continue;

        const key = [start.actor.id, end.actor.id, relationship.type].join(':');
        if (drawnRelationships.has(key)) continue;
        drawnRelationships.add(key);

        const line = new google.maps.Polyline({
          map,
          path: [start.coords, end.coords],
          geodesic: true,
          strokeColor: relationship.type === 'represents' ? '#f59e0b' : '#38bdf8',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          zIndex: 1,
        });
        relationships.push(line);
      }
    });

    if (visibleActors.length > 0 && !bounds.isEmpty()) {
      map.fitBounds(bounds);
    }

    return () => {
      zoomListener.remove();
      markers.forEach((marker) => { marker.map = null; });
      relationships.forEach((relationship) => relationship.setMap(null));
    };
  }, [categories, isMapLoaded, visibleActors]);

  const toggleLayer = (layer: string) => {
    setSelectedLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 60px)', backgroundColor: '#090d16', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* Overlay Título */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 10, color: '#ffffff', pointerEvents: 'none' }}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
          CAPAS NODALES / ZOOM SEMÁNTICO
        </p>
        <h1 style={{ fontSize: '48px', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>
          El territorio<br />conectado.
        </h1>
        <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '12px' }}>
          Acercate para descubrir la red.
        </p>
      </div>

      {/* Panel CAPAS */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px', zIndex: 10,
        backgroundColor: 'rgba(13, 17, 29, 0.85)', backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b', borderRadius: '6px', padding: '16px', width: '160px', color: '#ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>CAPAS</span>
          <span style={{ fontSize: '10px', color: '#64748b' }}>—</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '70vh', overflowY: 'auto' }}>
          {categories.map((category) => (
            <label key={category.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedLayers[category.id] ?? category.visibleByDefault !== false}
                onChange={() => toggleLayer(category.id)}
                style={{ accentColor: '#22c55e', cursor: 'pointer' }}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      {/* Contenedor del Mapa */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Indicador de Errores o Carga */}
      {apiError ? (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 30, background: '#1e1b4b', color: '#f87171', padding: '16px 24px',
          borderRadius: '8px', border: '1px solid #ef4444', fontSize: '13px', textAlign: 'center', maxWidth: '380px'
        }}>
          <strong>Error de Google Maps</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#fca5a5' }}>{apiError}</p>
        </div>
      ) : (loadingData || !isMapLoaded) && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 30, background: '#0d111d', color: '#ffffff', padding: '12px 24px',
          borderRadius: '6px', border: '1px solid #334155', fontSize: '13px'
        }}>
          Cargando mapa satelital...
        </div>
      )}
    </div>
  );
};