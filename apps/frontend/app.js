const state = { home: null, account: null, token: localStorage.getItem('daa-token'), view: 'map' };
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const date = (value) => new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
const accounts = { 'participante@dronsair.ar': { password: 'participante', role: 'participant' }, 'dealer@dronsair.ar': { password: 'dealer', role: 'dealer' } };

async function api(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('No se pudo cargar la plataforma');
  return response.json();
}

function activityCard(activity) {
  const month = new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(new Date(activity.startsAt));
  return `<article class="activity-row"><div class="activity-date"><strong>${new Date(activity.startsAt).getDate()}</strong><span>${month.toUpperCase()}</span></div><div><strong>${escapeHtml(activity.title)}</strong><span>${escapeHtml(activity.location)} · ${activity.type}</span></div><b class="arrow">↗</b></article>`;
}

function renderHome() {
  const { stats, participants, directory, activities } = state.home;
  $('#view-title').textContent = 'Estado del sistema';
  $('#view').innerHTML = `<section class="welcome"><div><p class="eyebrow">${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>El ecosistema<br /><em>está en movimiento.</em></h1><p>Una vista viva de las personas, organizaciones y actividades que construyen DAA.</p></div><div class="welcome-mark">DAA<span>01</span></div></section><section class="stat-grid"><article><small>PARTICIPANTES</small><strong>${stats.participants}</strong><span>en trayectoria</span></article><article><small>DIRECTORIO</small><strong>${stats.directory}</strong><span>actores observados</span></article><article><small>ACTIVIDADES</small><strong>${stats.activities}</strong><span>próximas y publicadas</span></article><article class="stat-accent"><small>ENTRADA PROGRESIVA</small><strong>${participants.filter((item) => item.informationStatus === 'advanced').length}</strong><span>perfiles avanzados</span></article></section><section class="home-grid"><div class="panel map-preview"><div class="panel-head"><div><p class="eyebrow">Mapa nodal</p><h3>El territorio conectado</h3></div><button class="text-button" data-view="map">Abrir mapa →</button></div><div class="mini-map"><span class="map-label">ARGENTINA / RED DAA</span></div></div><div class="panel upcoming"><div class="panel-head"><div><p class="eyebrow">Agenda</p><h3>Próximas actividades</h3></div><button class="text-button" data-view="activities">Ver todas →</button></div>${activities.slice(0, 3).map(activityCard).join('')}</div></section>`;
}

function mapColor(layer) {
  return { dealers: '#f4865c', service: '#c9e86b', operators: '#55d0c1', manufacturer: '#7770d8', institution: '#f1c75b', organization: '#e891c4', professional: '#73a9ed', event: '#ff9b55', activities: '#ffb347', media: '#c084fc', research: '#65d6e8', technology: '#a4d65e', public: '#f27d7d', participants: '#ffffff' }[layer] || '#b9c7c5';
}

function canonicalLayer(node) {
  const knownLayers = ['dealers', 'service', 'operators', 'manufacturer', 'institution', 'organization', 'professional', 'event', 'media', 'research', 'technology', 'public'];
  const aliases = { events: 'event', academia: 'research', companies: 'organization', company: 'organization', drones: 'technology' };
  return aliases[node.layers?.find((layer) => aliases[layer] || knownLayers.includes(layer)) || ''] || node.layers?.find((layer) => knownLayers.includes(layer)) || aliases[node.type] || 'organization';
}

function mapFeatures() {
  const layers = ['dealers', 'service', 'operators', 'manufacturer', 'institution', 'organization', 'professional', 'event', 'media', 'research', 'technology', 'public'];
  const directoryFeatures = state.home.directory.map((node, index) => {
    const coordinates = node.location?.coordinates ? [node.location.coordinates.lng, node.location.coordinates.lat] : [-64 + (index % 8) * 2.7, -38 + (index % 7) * 2.2];
    const layer = canonicalLayer(node);
    return { type: 'Feature', geometry: { type: 'Point', coordinates }, properties: { id: node.id, name: node.name, layer, description: `${node.type} · ${node.status}`, color: mapColor(layer), provisional: !node.location?.coordinates } };
  });
  const participantFeatures = state.home.participants.map((participant, index) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [-57 + (index % 5) * 2.4, -42 + (index % 4) * 2.5] }, properties: { id: participant.id, name: participant.id, layer: 'participants', description: `Trayectoria ${participant.informationStatus}`, color: mapColor('participants'), provisional: true } }));
  const activityFeatures = state.home.activities.map((activity, index) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [-63 + (index % 6) * 2.9, -39 + (index % 3) * 3.8] }, properties: { id: activity.id, name: activity.title, layer: 'activities', description: `${activity.type} · ${activity.location}`, color: mapColor('activities'), provisional: true } }));
  return { type: 'FeatureCollection', features: [...directoryFeatures, ...participantFeatures, ...activityFeatures], layers: [...layers, 'activities'] };
}

function showMapDetail(properties) {
  const detail = $('#map-detail');
  detail.classList.remove('hidden');
  detail.innerHTML = `<button class="detail-close">×</button><p class="eyebrow">${escapeHtml(properties.layer)}</p><h2>${escapeHtml(properties.name)}</h2><p>${escapeHtml(properties.description)}</p><small>${properties.provisional ? 'Ubicación provisional: falta georreferenciar la dirección.' : 'Ubicación georreferenciada.'}</small>`;
  detail.querySelector('.detail-close').addEventListener('click', () => detail.classList.add('hidden'));
}

function renderFallbackNodes(features) {
  const map = $('#ecosystem-map');
  const layerControls = $('#map-layer-controls');
  const visibleLayers = () => new Set([...layerControls.querySelectorAll('input:checked')].map((input) => input.dataset.mapLayer));
  const fallback = document.createElement('div');
  fallback.className = 'map-node-fallback';
  features.forEach((feature, index) => {
    const node = document.createElement('button');
    node.className = 'fallback-node';
    node.dataset.layer = feature.properties.layer;
    node.style.setProperty('--x', `${8 + ((index * 37) % 84)}%`);
    node.style.setProperty('--y', `${12 + ((index * 23) % 74)}%`);
    node.style.setProperty('--node-color', feature.properties.color);
    node.title = feature.properties.name;
    node.addEventListener('mouseenter', () => showMapDetail(feature.properties));
    node.addEventListener('click', () => showMapDetail(feature.properties));
    fallback.appendChild(node);
  });
  map.appendChild(fallback);
  const update = () => { const selected = visibleLayers(); fallback.querySelectorAll('.fallback-node').forEach((node) => { node.classList.toggle('is-hidden', !selected.has(node.dataset.layer)); }); };
  layerControls.querySelectorAll('input').forEach((input) => input.addEventListener('change', update));
  update();
}

function renderMap() {
  $('#view-title').textContent = 'Mapa del ecosistema';
  $('#view').innerHTML = `<div class="map-screen"><div class="map-overlay map-copy"><p class="eyebrow">Capas nodales / zoom semántico</p><h1>El territorio<br /><em>conectado.</em></h1><p>Acercate para descubrir la red.</p></div><div class="map-overlay map-controls"><strong>Capas</strong><div id="map-layer-controls"></div></div><div id="ecosystem-map" class="ecosystem-map"></div><aside id="map-detail" class="map-detail hidden"></aside></div>`;
  const data = mapFeatures();
  const mapStyle = { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' } }, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#101b20' } }, { id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-opacity': 0.18, 'raster-saturation': -1, 'raster-contrast': 0.2 } }] };
  const controls = $('#map-layer-controls');
  data.layers.concat(['participants']).forEach((layer) => controls.insertAdjacentHTML('beforeend', `<label><input type="checkbox" checked data-map-layer="${layer}" /><i style="background:${mapColor(layer)}"></i>${layer}</label>`));
  const map = new maplibregl.Map({ container: 'ecosystem-map', center: [-63.6, -35.5], zoom: 3.1, minZoom: 2.4, maxZoom: 12, style: mapStyle, attributionControl: false });
  window.setTimeout(() => { if (!map.isStyleLoaded()) renderFallbackNodes(data.features); }, 1200);
  map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
  map.on('load', () => {
    map.addSource('ecosystem', { type: 'geojson', data, cluster: true, clusterMaxZoom: 7, clusterRadius: 48 });
    map.addLayer({ id: 'clusters', type: 'circle', source: 'ecosystem', filter: ['has', 'point_count'], paint: { 'circle-color': '#7770d8', 'circle-opacity': 0.85, 'circle-radius': ['step', ['get', 'point_count'], 18, 20, 25, 80, 32], 'circle-stroke-color': '#c9e86b', 'circle-stroke-width': 1 } });
    map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'ecosystem', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 11 }, paint: { 'text-color': '#ffffff' } });
    map.addLayer({ id: 'nodes', type: 'circle', source: 'ecosystem', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': ['get', 'color'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 4, 7, 7, 11, 10], 'circle-blur': 0.15, 'circle-opacity': 0.95, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } });
    map.addLayer({ id: 'node-labels', type: 'symbol', source: 'ecosystem', minzoom: 7, filter: ['!', ['has', 'point_count']], layout: { 'text-field': ['get', 'name'], 'text-size': 11, 'text-offset': [0, 1.4], 'text-anchor': 'top' }, paint: { 'text-color': '#ffffff', 'text-halo-color': '#101b20', 'text-halo-width': 2 } });
    controls.querySelectorAll('input').forEach((input) => input.addEventListener('change', () => { const selected = [...controls.querySelectorAll('input:checked')].map((item) => item.dataset.mapLayer); const filter = ['in', ['get', 'layer'], ['literal', selected]]; map.setFilter('nodes', filter); map.setFilter('node-labels', filter); }));
    map.on('mouseenter', 'nodes', (event) => { map.getCanvas().style.cursor = 'pointer'; if (event.features?.[0]) showMapDetail(event.features[0].properties); });
    map.on('mouseleave', 'nodes', () => { map.getCanvas().style.cursor = ''; });
    map.on('click', 'nodes', (event) => { if (event.features?.[0]) showMapDetail(event.features[0].properties); });
  });
}

async function loadGoogleMaps() {
  const config = await api('/api/maps-config');
  if (!config.googleMapsApiKey) return false;
  if (window.google?.maps) return true;
  await new Promise((resolve, reject) => {
    const callback = `daaGoogleMapsReady_${Date.now()}`;
    window[callback] = resolve;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.googleMapsApiKey)}&libraries=geometry&callback=${callback}`;
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return Boolean(window.google?.maps);
}

function renderGoogleMap() {
  $('#view-title').textContent = 'Mapa del ecosistema';
  $('#view').innerHTML = `<div class="map-screen google-map-screen"><div class="map-overlay map-copy"><p class="eyebrow">Capas nodales / zoom semántico</p><h1>El territorio<br /><em>conectado.</em></h1><p>Acercate para descubrir la red.</p></div><div class="map-overlay map-controls"><strong>Capas</strong><div id="map-layer-controls"></div></div><div id="ecosystem-map" class="ecosystem-map"></div><aside id="map-detail" class="map-detail hidden"></aside></div>`;
  const data = mapFeatures();
  const controls = $('#map-layer-controls');
  data.layers.concat(['participants']).forEach((layer) => controls.insertAdjacentHTML('beforeend', `<label><input type="checkbox" checked data-map-layer="${layer}" /><i style="background:${mapColor(layer)}"></i>${layer}</label>`));
  loadGoogleMaps().then((available) => {
    if (!available) { renderFallbackNodes(data.features); return; }
    const map = new google.maps.Map($('#ecosystem-map'), { center: { lat: -35.5, lng: -63.6 }, zoom: 4, minZoom: 3, maxZoom: 16, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, clickableIcons: false, styles: [{ elementType: 'geometry', stylers: [{ color: '#17212b' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#17212b' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#9fb4c1' }] }, { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#637482' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e2638' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#263744' }] }] });
    class NodeOverlay extends google.maps.OverlayView {
      constructor(feature) { super(); this.feature = feature; this.node = document.createElement('button'); this.node.className = 'google-node'; this.node.dataset.layer = feature.properties.layer; this.node.title = feature.properties.name; this.node.style.setProperty('--node-color', feature.properties.color); this.node.addEventListener('mouseenter', () => showMapDetail(feature.properties)); this.node.addEventListener('click', () => showMapDetail(feature.properties)); }
      onAdd() { this.getPanes().overlayMouseTarget.appendChild(this.node); }
      draw() { const projection = this.getProjection(); const position = projection.fromLatLngToDivPixel(new google.maps.LatLng(this.feature.geometry.coordinates[1], this.feature.geometry.coordinates[0])); this.node.style.left = `${position.x}px`; this.node.style.top = `${position.y}px`; }
      onRemove() { this.node.remove(); }
    }
    const overlays = data.features.map((feature) => { const overlay = new NodeOverlay(feature); overlay.setMap(map); return overlay; });
    const updateVisibility = () => { const selected = new Set([...controls.querySelectorAll('input:checked')].map((input) => input.dataset.mapLayer)); overlays.forEach((overlay) => overlay.node.classList.toggle('is-hidden', !selected.has(overlay.node.dataset.layer))); };
    controls.querySelectorAll('input').forEach((input) => input.addEventListener('change', updateVisibility));
    map.addListener('zoom_changed', () => { const compact = map.getZoom() < 5; $('#ecosystem-map').classList.toggle('map-compact', compact); });
    updateVisibility();
  }).catch(() => renderFallbackNodes(data.features));
}

function directoryCard(node) { return `<article class="directory-card"><div class="directory-symbol">${escapeHtml(node.name).slice(0, 1)}</div><div class="directory-main"><div class="directory-title"><h3>${escapeHtml(node.name)}</h3><span class="verified">${node.status}</span></div><p>${node.type} ${node.location?.province ? `· ${escapeHtml(node.location.province)}` : ''}</p><div class="tags">${node.layers.slice(0, 3).map((layer) => `<span>${escapeHtml(layer)}</span>`).join('')}</div></div><span class="arrow">↗</span></article>`; }
function filterDirectory() { const query = $('#directory-search').value.toLowerCase(); const type = $('#directory-filter').value; $('#directory-list').innerHTML = state.home.directory.filter((node) => (type === 'all' || node.type === type || node.layers.includes(type)) && `${node.name} ${node.type} ${node.layers.join(' ')}`.toLowerCase().includes(query)).map(directoryCard).join('') || '<div class="empty-state">No hay actores que coincidan con la búsqueda.</div>'; }
function renderDirectory() { $('#view-title').textContent = 'Directorio'; $('#view').innerHTML = `<div class="page-intro"><div><p class="eyebrow">Actores del ecosistema</p><h1>Directorio</h1></div><p>Cada categoría se representa también como capa del mapa.</p></div><div class="filters"><input id="directory-search" placeholder="Buscar actor, marca o capacidad..." /><select id="directory-filter"><option value="all">Todas las categorías</option><option value="dealers">Dealers</option><option value="service">Servicios</option><option value="operators">Operadores</option><option value="manufacturer">Fabricantes</option><option value="institution">Instituciones</option><option value="organization">Organizaciones</option><option value="professional">Profesionales</option><option value="event">Eventos</option><option value="media">Medios</option><option value="research">Academia / investigación</option><option value="technology">Tecnología</option><option value="public">Sector público</option></select></div><div id="directory-list" class="directory-list">${state.home.directory.map(directoryCard).join('')}</div>`; $('#directory-search').addEventListener('input', filterDirectory); $('#directory-filter').addEventListener('change', filterDirectory); }
function renderActivities() { $('#view-title').textContent = 'Actividades'; $('#view').innerHTML = `<div class="page-intro"><div><p class="eyebrow">Agenda de la comunidad</p><h1>Actividades</h1></div><p>Eventos, exposiciones, cursos y encuentros.</p></div><div class="activity-list">${state.home.activities.map(activityCard).join('')}</div>`; }
function renderView(view = state.view) { state.view = view; document.querySelectorAll('.nav-item[data-view]').forEach((item) => item.classList.toggle('active', item.dataset.view === view)); ({ home: renderHome, map: renderGoogleMap, directory: renderDirectory, activities: renderActivities }[view] || renderGoogleMap)(); }

async function loadPlatform() { state.home = await api('/api/home'); $('#login-view').classList.add('hidden'); $('#platform').classList.remove('hidden'); $('#account-label').textContent = state.account.email; $('#role-badge').textContent = state.account.role.toUpperCase(); renderView(); }
$('#login-form').addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const email = String(form.get('email')); const account = accounts[email]; if (!account || account.password !== form.get('password')) { $('#login-error').textContent = 'Credenciales inválidas'; return; } state.account = { email, role: account.role }; state.token = `frontend-${crypto.randomUUID()}`; localStorage.setItem('daa-token', state.token); localStorage.setItem('daa-account', JSON.stringify(state.account)); await loadPlatform(); });
document.addEventListener('click', (event) => { const target = event.target.closest('[data-view]'); if (target) renderView(target.dataset.view); });
$('#logout').addEventListener('click', () => { localStorage.removeItem('daa-token'); localStorage.removeItem('daa-account'); location.reload(); });
$('#refresh').addEventListener('click', loadPlatform);
if (state.token) { state.account = JSON.parse(localStorage.getItem('daa-account') || 'null'); if (state.account) loadPlatform(); else localStorage.removeItem('daa-token'); }
