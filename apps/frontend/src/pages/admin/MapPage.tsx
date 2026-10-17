/// <reference types="google.maps" />
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { DEFAULT_CATEGORIES, type Category } from '../../types/category';
import { loadGoogleMaps } from '../../lib/googleMaps';
import { useAuth } from '../../context/AuthContext';
import gridInitialUrl from '../../../../grillas/9-Transp.png';
import gridRegionalUrl from '../../../../grillas/21-Transp.png';
import gridDetailUrl from '../../../../grillas/27-Transp.png';

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
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
  };
  location?: {
    address?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    coordinates?: {
      latitude: number | string | null;
      longitude: number | string | null;
    } | null;
  };
  geolocation?: {
    latitude: number | string | null;
    longitude: number | string | null;
  };
  presence?: {
    website?: string | null;
  };
}

const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID';
const GRID_REGIONAL_ZOOM = 7;
const GRID_DETAIL_ZOOM = 11;

const getGridImageForZoom = (zoom: number): string => {
  if (zoom >= GRID_DETAIL_ZOOM) return gridDetailUrl;
  if (zoom >= GRID_REGIONAL_ZOOM) return gridRegionalUrl;
  return gridInitialUrl;
};

const extractCoordinates = (actor: Actor): { lat: number; lng: number } | null => {
  const rawLat = actor.geolocation?.latitude ?? actor.location?.coordinates?.latitude;
  const rawLng = actor.geolocation?.longitude ?? actor.location?.coordinates?.longitude;

  if (rawLat == null || rawLng == null) return null;

  const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
  const lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng;

  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

  return { lat, lng };
};

const makePopupLink = (href: string, label: string, external = false): HTMLAnchorElement => {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = label;
  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return link;
};

const createActorPopup = (
  actor: Actor,
  categories: Category[],
  onClose: () => void,
): HTMLDivElement => {
  const content = document.createElement('div');
  content.className = 'map-actor-popup';

  const header = document.createElement('div');
  header.className = 'map-actor-popup__header';
  const categoryList = document.createElement('div');
  categoryList.className = 'map-actor-popup__categories';
  const categoryIds = actor.layers?.length ? actor.layers : actor.categoryLabel ? [actor.categoryLabel] : [];
  const categoryNames = [...new Set(categoryIds)].map((id) =>
    categories.find((category) => category.id === id)?.name ?? id
  );
  if (!categoryNames.length) categoryNames.push('Entidad');
  categoryNames.forEach((name) => {
    const badge = document.createElement('span');
    badge.className = 'map-actor-popup__category';
    badge.textContent = name;
    categoryList.append(badge);
  });
  const closeButton = document.createElement('button');
  closeButton.className = 'map-actor-popup__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Cerrar ficha');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', onClose);
  header.append(categoryList, closeButton);

  const title = document.createElement('h2');
  title.className = 'map-actor-popup__title';
  title.textContent = actor.name;
  content.append(header, title);

  const address = [
    actor.location?.address ?? actor.contact?.address,
    actor.location?.city ?? actor.contact?.city,
    actor.location?.province ?? actor.contact?.province,
    actor.location?.country ?? actor.contact?.country,
  ].filter(Boolean).join(', ');
  if (address) {
    const addressLine = document.createElement('p');
    addressLine.className = 'map-actor-popup__address';
    addressLine.textContent = `📍 ${address}`;
    content.append(addressLine);
  }

  const contact = document.createElement('div');
  contact.className = 'map-actor-popup__links';
  if (actor.contact?.email) {
    contact.append(makePopupLink(`mailto:${actor.contact.email}`, `✉ ${actor.contact.email}`));
  }
  if (actor.contact?.phone) {
    const phone = actor.contact.phone.replace(/[^\d+]/g, '');
    if (phone) contact.append(makePopupLink(`tel:${phone}`, `☎ ${actor.contact.phone}`));
  }
  if (actor.contact?.whatsapp) {
    const whatsapp = actor.contact.whatsapp.replace(/\D/g, '');
    if (whatsapp) {
      const whatsappLink = makePopupLink(`https://wa.me/${whatsapp}`, `WhatsApp ${actor.contact.whatsapp}`, true);
      whatsappLink.classList.add('map-actor-popup__whatsapp');
      contact.append(whatsappLink);
    }
  }
  if (actor.presence?.website) {
    const rawWebsite = actor.presence.website.trim();
    const website = /^[a-z][a-z\d+.-]*:/i.test(rawWebsite) ? rawWebsite : `https://${rawWebsite}`;
    try {
      if (['http:', 'https:'].includes(new URL(website).protocol)) {
        contact.append(makePopupLink(website, `↗ ${rawWebsite}`, true));
      }
    } catch {
      console.error(`URL de sitio web inválida para el actor "${actor.id}".`);
    }
  }
  if (contact.childElementCount) content.append(contact);

  const directoryLink = makePopupLink(`/directory?actor=${encodeURIComponent(actor.id)}`, 'Ver en el directorio');
  directoryLink.className = 'map-actor-popup__directory';
  directoryLink.textContent = '';
  const directoryIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  directoryIcon.setAttribute('aria-hidden', 'true');
  directoryIcon.setAttribute('viewBox', '0 0 24 24');
  directoryIcon.setAttribute('width', '15');
  directoryIcon.setAttribute('height', '15');
  directoryIcon.setAttribute('fill', 'none');
  directoryIcon.setAttribute('stroke', 'currentColor');
  directoryIcon.setAttribute('stroke-width', '1.8');
  directoryIcon.setAttribute('stroke-linecap', 'round');
  directoryIcon.setAttribute('stroke-linejoin', 'round');
  const directoryIconPaths = [
    'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z',
    'M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 6h8M8 9h8',
  ];
  directoryIconPaths.forEach((d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    directoryIcon.append(path);
  });
  directoryLink.append(directoryIcon, document.createTextNode('Ver en el directorio'));
  content.append(directoryLink);
  return content;
};

export const MapPage: React.FC = () => {
  const { token } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerLibraryRef = useRef<typeof google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const hasAppliedLocationQueryRef = useRef<boolean>(false);
  const markersByActorIdRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement | google.maps.Marker>>(new Map());

  const [actors, setActors] = useState<Actor[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<Record<string, boolean>>({});
  const [actorSearch, setActorSearch] = useState('');
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const locationQuery = new URLSearchParams(window.location.search);
  const rawFocusLat = locationQuery.get('lat');
  const rawFocusLng = locationQuery.get('lng');
  const focusLat = rawFocusLat === null ? NaN : Number(rawFocusLat);
  const focusLng = rawFocusLng === null ? NaN : Number(rawFocusLng);
  const focusAddress = locationQuery.get('q')?.trim() ?? '';
  const hasCoordinateFocus = Number.isFinite(focusLat)
    && Number.isFinite(focusLng)
    && Math.abs(focusLat) <= 90
    && Math.abs(focusLng) <= 180;
  const hasLocationQuery = hasCoordinateFocus || Boolean(focusAddress);

  // Capturar errores de autenticación de Google Maps a nivel global
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      setApiError('Error de autenticación con Google Maps (API Key inválida o sin permisos para localhost).');
    };
  }, []);

  // 1. Cargar el SDK de Google Maps
  useEffect(() => {
    let isActive = true;
    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        const { maps, marker } = await loadGoogleMaps();
        if (!isActive || !mapContainerRef.current || mapInstanceRef.current) return;

        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: -38.416097, lng: -63.616672 },
          zoom: 4,
          mapId: MAP_ID,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          zoomControl: true,
        });

        markerLibraryRef.current = marker.AdvancedMarkerElement;
        mapInstanceRef.current = map;
        infoWindowRef.current = new maps.InfoWindow();

        const gridImage = document.createElement('img');
        gridImage.src = gridInitialUrl;
        gridImage.alt = '';
        gridImage.setAttribute('aria-hidden', 'true');
        Object.assign(gridImage.style, {
          position: 'absolute',
          opacity: '0.45',
          pointerEvents: 'none',
          userSelect: 'none',
        });
        const gridOverlay = new maps.OverlayView();
        gridOverlay.onAdd = () => {
          gridOverlay.getPanes()?.overlayLayer.append(gridImage);
        };
        gridOverlay.draw = () => {
          const bounds = map.getBounds();
          if (!bounds) return;
          const projection = gridOverlay.getProjection();
          const northEast = bounds.getNorthEast();
          const southWest = bounds.getSouthWest();
          const topLeft = projection.fromLatLngToDivPixel(
            new maps.LatLng(northEast.lat(), southWest.lng()),
          );
          const bottomRight = projection.fromLatLngToDivPixel(
            new maps.LatLng(southWest.lat(), northEast.lng()),
          );
          if (!topLeft || !bottomRight) return;
          Object.assign(gridImage.style, {
            left: `${topLeft.x}px`,
            top: `${topLeft.y}px`,
            width: `${bottomRight.x - topLeft.x}px`,
            height: `${bottomRight.y - topLeft.y}px`,
          });
        };
        gridOverlay.onRemove = () => gridImage.remove();
        gridOverlay.setMap(map);
        map.addListener('zoom_changed', () => {
          gridImage.src = getGridImageForZoom(map.getZoom() ?? 4);
        });

        setIsMapLoaded(true);
      } catch (e) {
        console.error('Error al inicializar el mapa:', e);
        if (isActive) {
          setApiError(e instanceof Error ? e.message : 'No se pudo inicializar la instancia del mapa.');
        }
      }
    };

    void initMap();

    return () => {
      isActive = false;
    };
  }, []);

  // 2. Fetch de datos
  useEffect(() => {
    const fetchActors = async () => {
      try {
        const [actorsResponse, categoriesResponse, participantsResponse] = await Promise.all([
          fetch('/api/actors', {
            headers: token ? { Authorization: 'Bear' + 'er ' + token } : {},
          }),
          fetch('/api/categories'),
          fetch('/api/participants/map', {
            headers: token ? { Authorization: 'Bear' + 'er ' + token } : {},
          }),
        ]);
        if (!actorsResponse.ok) throw new Error(`No se pudieron cargar los actores (HTTP ${actorsResponse.status}).`);
        if (!categoriesResponse.ok) throw new Error(`No se pudieron cargar las categorías (HTTP ${categoriesResponse.status}).`);
        if (!participantsResponse.ok) throw new Error(`No se pudieron cargar los participantes para el mapa (HTTP ${participantsResponse.status}).`);
        const [data, loadedCategories, mapParticipants]: [Actor[], Category[], Actor[]] = await Promise.all([
          actorsResponse.json(),
          categoriesResponse.json(),
          participantsResponse.json(),
        ]);
        setActors([...data, ...mapParticipants]);
        setCategories(loadedCategories);
        const visibleLayerIds = new Set(locationQuery.getAll('layer'));
        for (const layerId of [...visibleLayerIds]) {
          let category = loadedCategories.find((entry) => entry.id === layerId);
          const visited = new Set<string>();
          while (category?.parentId && !visited.has(category.id)) {
            visited.add(category.id);
            visibleLayerIds.add(category.parentId);
            category = loadedCategories.find((entry) => entry.id === category?.parentId);
          }
        }
        setSelectedLayers(Object.fromEntries(
          loadedCategories.map((category) => [
            category.id,
            visibleLayerIds.has(category.id) || category.visibleByDefault !== false,
          ])
        ));
      } catch (err) {
        console.error('Error al cargar actores:', err);
        setApiError(err instanceof Error ? err.message : 'No se pudieron cargar los datos del mapa.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchActors();
  }, [token]);

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
    const markers: Array<google.maps.marker.AdvancedMarkerElement | google.maps.Marker> = [];
    const markerContents: HTMLDivElement[] = [];
    const relationships: Array<{
      line: google.maps.Polyline;
      nodeIds: [string, string];
      hoverOnly: boolean;
    }> = [];
    const bounds = new google.maps.LatLngBounds();
    const visibleById = new Map(visibleActors.map(({ actor, coords }) => [actor.id, { actor, coords }]));
    markersByActorIdRef.current.clear();

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

      const marker = AdvancedMarkerElement
        ? new AdvancedMarkerElement({
            position: coords,
            map,
            title: actor.name,
            gmpClickable: true,
            zIndex: 1000,
            anchorLeft: '-50%',
            anchorTop: '-50%',
          })
        : new google.maps.Marker({
            position: coords,
            map,
            title: actor.name,
            zIndex: 1000,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: markerColor,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 7,
            },
          });
      if (marker instanceof google.maps.Marker) {
        marker.addListener('mouseover', () => {
          relationships.forEach(({ line, nodeIds, hoverOnly }) => {
            if (hoverOnly && nodeIds.includes(actor.id)) line.setMap(map);
          });
        });
        marker.addListener('mouseout', () => {
          relationships.forEach(({ line, nodeIds, hoverOnly }) => {
            if (hoverOnly && nodeIds.includes(actor.id)) line.setMap(null);
          });
        });
      } else {
        marker.append(markerContent);
        markerContent.addEventListener('mouseenter', () => {
          relationships.forEach(({ line, nodeIds, hoverOnly }) => {
            if (hoverOnly && nodeIds.includes(actor.id)) line.setMap(map);
          });
        });
        markerContent.addEventListener('mouseleave', () => {
          relationships.forEach(({ line, nodeIds, hoverOnly }) => {
            if (hoverOnly && nodeIds.includes(actor.id)) line.setMap(null);
          });
        });
      }
      markers.push(marker);
      markerContents.push(markerContent);
      markersByActorIdRef.current.set(actor.id, marker);

      const showActorPopup = () => {
        if (infoWindowRef.current) {
          const popupContent = createActorPopup(actor, categories, () => infoWindowRef.current?.close());
          infoWindowRef.current.setOptions({
            headerDisabled: true,
            pixelOffset: new google.maps.Size(0, -12),
          });
          infoWindowRef.current.setContent(popupContent);
          infoWindowRef.current.open({ map, anchor: marker });
        }
      };
      if (marker instanceof google.maps.Marker) marker.addListener('click', showActorPopup);
      else marker.addEventListener('gmp-click', showActorPopup);
    });

    const updateMarkerScale = () => {
      const zoom = map.getZoom() ?? 4;
      const scale = Math.min(1.65, Math.max(0.75, 0.8 + (zoom - 4) * 0.1));
      markerContents.forEach((content) => content.style.setProperty('--zoom-scale', String(scale)));
    };
    const zoomListener = map.addListener('zoom_changed', updateMarkerScale);
    updateMarkerScale();

    if (hasLocationQuery && !hasAppliedLocationQueryRef.current) {
      hasAppliedLocationQueryRef.current = true;
      if (hasCoordinateFocus) {
        map.setCenter({ lat: focusLat, lng: focusLng });
        map.setZoom(13);
      } else {
        new google.maps.Geocoder().geocode({ address: focusAddress }, (results, status) => {
          const location = results?.[0]?.geometry.location;
          if (status === 'OK' && location) {
            map.setCenter(location);
            map.setZoom(13);
            return;
          }
          console.error(`No se pudo ubicar "${focusAddress}" en el mapa (${status}).`);
          setApiError(`No se pudo ubicar la dirección en el mapa (${status}).`);
        });
      }
    }

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

        const hoverOnly = ['parent_of', 'child_of', 'represents'].includes(relationship.type);
        const line = new google.maps.Polyline({
          map: hoverOnly ? null : map,
          path: [start.coords, end.coords],
          geodesic: true,
          strokeColor: relationship.type === 'represents' ? '#f59e0b' : '#38bdf8',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          zIndex: 1,
        });
        relationships.push({
          line,
          nodeIds: [start.actor.id, end.actor.id],
          hoverOnly,
        });
      }
    });

    if (!hasLocationQuery && visibleActors.length > 0 && !bounds.isEmpty()) {
      map.fitBounds(bounds);
    }

    return () => {
      zoomListener.remove();
      markers.forEach((marker) => {
        if (marker instanceof google.maps.Marker) marker.setMap(null);
        else marker.map = null;
      });
      markersByActorIdRef.current.clear();
      relationships.forEach(({ line }) => line.setMap(null));
    };
  }, [categories, isMapLoaded, visibleActors]);

  const matchingActors = useMemo(() => {
    const query = actorSearch.trim().toLocaleLowerCase();
    if (!query) return [];
    return visibleActors
      .filter(({ actor }) => actor.name.toLocaleLowerCase().includes(query))
      .slice(0, 8);
  }, [actorSearch, visibleActors]);

  const focusActorOnMap = (actorId: string) => {
    const marker = markersByActorIdRef.current.get(actorId);
    const map = mapInstanceRef.current;
    if (!marker || !map) return;
    const markerPosition = marker instanceof google.maps.Marker
      ? marker.getPosition()
      : marker.position;
    if (!markerPosition) return;
    const position = markerPosition instanceof google.maps.LatLng
      ? markerPosition
      : new google.maps.LatLng(markerPosition);
    map.panTo(position);
    map.setZoom(Math.max(map.getZoom() ?? 4, 12));
    if (marker instanceof google.maps.Marker) google.maps.event.trigger(marker, 'click');
    else marker.dispatchEvent(new Event('gmp-click'));
    setActorSearch('');
  };

  const toggleLayer = (layer: string) => {
    setSelectedLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', backgroundColor: '#090d16', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* Overlay Título */}
    <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 1, color: '#ffffff', pointerEvents: 'none' }}>
        <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
          CAPAS NODALES / ZOOM SEMÁNTICO
        </p>
        <h1 style={{ fontSize: '48px', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>
          El territorio<br />conectado.
        </h1>
        <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '12px' }}>
          Acercate para descubrir la red.
        </p>
        <div className="map-search">
          <label className="map-actor-search">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              value={actorSearch}
              onChange={(event) => setActorSearch(event.target.value)}
              placeholder="Buscar actor en el mapa"
              aria-label="Buscar actor en el mapa"
            />
          </label>
          {actorSearch.trim() && (
            <div className="map-actor-search-results">
              {matchingActors.length ? matchingActors.map(({ actor }) => (
                <button key={actor.id} type="button" onClick={() => focusActorOnMap(actor.id)}>
                  {actor.name}
                </button>
              )) : <p>No hay actores visibles con ese nombre.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Control de capas */}
      <div className={`map-overlay map-controls${isLayersPanelOpen ? '' : ' is-collapsed'}`}>
        <button
          type="button"
          className="map-controls-toggle"
          aria-expanded={isLayersPanelOpen}
          onClick={() => setIsLayersPanelOpen((open) => !open)}
        >
          <span>Capas <small>{categories.length}</small></span>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {isLayersPanelOpen
              ? <><path d="m6 9 6 6 6-6" /></>
              : <><path d="m9 18 6-6-6-6" /></>}
          </svg>
        </button>
        {isLayersPanelOpen && (
          <div className="map-layer-list">
            {categories.map((category) => {
              const isVisible = selectedLayers[category.id] ?? category.visibleByDefault !== false;
              return (
                <div key={category.id} className={`map-layer-row${isVisible ? ' is-visible' : ''}`}>
                  <button
                    type="button"
                    className="map-layer-visibility"
                    aria-label={`${isVisible ? 'Ocultar' : 'Mostrar'} capa ${category.name}`}
                    aria-pressed={isVisible}
                    title={`${isVisible ? 'Ocultar' : 'Mostrar'} ${category.name}`}
                    onClick={() => toggleLayer(category.id)}
                  >
                    {isVisible ? (
                      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 3 18 18M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3 3.9M6.2 6.3C3.5 8.1 2 12 2 12s3.6 7 10 7c1.3 0 2.5-.3 3.5-.7" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      </svg>
                    )}
                  </button>
                  <span className="map-layer-color" style={{ backgroundColor: category.color }} />
                  <span className="map-layer-name">{category.name}</span>
                </div>
              );
            })}
          </div>
        )}
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