const state = {
  home: null,
  account: null,
  token: localStorage.getItem('daa-token'),
  view: 'map'
};

const $ = (selector) => document.querySelector(selector);

const escapeHtml = (value = '') =>
  String(value).replace(
    /[&<>'"]/g,
    (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char])
  );

const date = (value) =>
  new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));

const accounts = {
  'participante@dronsair.ar': {
    password: 'participante',
    role: 'participant'
  },
  'dealer@dronsair.ar': {
    password: 'dealer',
    role: 'dealer'
  }
};

let mapDetailHideTimer = null;

async function api(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error('No se pudo cargar la plataforma');
  }

  return response.json();
}

function validCoordinates(value) {
  return Number.isFinite(Number(value?.lng)) &&
    Number.isFinite(Number(value?.lat));
}

function activityCard(activity) {
  const month = new Intl.DateTimeFormat('es-AR', {
    month: 'short'
  }).format(new Date(activity.startsAt));

  return `
    <article class="activity-row">
      <div class="activity-date">
        <strong>${new Date(activity.startsAt).getDate()}</strong>
        <span>${month.toUpperCase()}</span>
      </div>
      <div>
        <strong>${escapeHtml(activity.title)}</strong>
        <span>${escapeHtml(activity.location)} · ${activity.type}</span>
      </div>
      <b class="arrow">↗</b>
    </article>
  `;
}

function renderHome() {
  $('#view-title').textContent = 'Inicio';

  $('#view').innerHTML = `
    <section class="home-view">
      <div class="home-intro">
        <p class="eyebrow">DRONSAIR / ECOSISTEMA</p>
        <h1>Una red que<br /><em>aprende con vos.</em></h1>
        <p>
          El ecosistema argentino de drones agrícolas,
          sus actores, capacidades y actividades.
        </p>
      </div>
    </section>
  `;
}

function mapColor(layer) {
  return {
    dealers: '#f4865c',
    service: '#c9e86b',
    operators: '#55d0c1',
    manufacturer: '#7770d8',
    institution: '#f1c75b',
    organization: '#e891c4',
    professional: '#73a9ed',
    event: '#ff9b55',
    activities: '#ffb347',
    media: '#c084fc',
    research: '#65d6e8',
    technology: '#a4d65e',
    public: '#f27d7d',
    participants: '#ffffff'
  }[layer] || '#b9c7c5';
}

function canonicalLayer(node) {
  const knownLayers = [
    'dealers',
    'service',
    'operators',
    'manufacturer',
    'institution',
    'organization',
    'professional',
    'event',
    'media',
    'research',
    'technology',
    'public'
  ];

  const aliases = {
    events: 'event',
    academia: 'research',
    companies: 'organization',
    company: 'organization',
    drones: 'technology'
  };

  const layer =
    node.layers?.find(
      (item) => aliases[item] || knownLayers.includes(item)
    ) || '';

  return (
    aliases[layer] ||
    node.layers?.find((item) => knownLayers.includes(item)) ||
    aliases[node.type] ||
    'organization'
  );
}

function mapFeatures() {
  const layers = [
    'dealers',
    'service',
    'operators',
    'manufacturer',
    'institution',
    'organization',
    'professional',
    'event',
    'media',
    'research',
    'technology',
    'public'
  ];

  const directoryFeatures = state.home.directory
    .filter((node) => validCoordinates(node.location?.coordinates))
    .map((node) => {
      const layer = canonicalLayer(node);

      const coordinates = [
        Number(node.location.coordinates.lng),
        Number(node.location.coordinates.lat)
      ];

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: {
          id: node.id,
          name: node.name,
          layer,
          description: `${node.type} · ${node.status}`,
          color: mapColor(layer),
          provisional: false
        }
      };
    });

  const participantFeatures = state.home.participants
    .filter((participant) =>
      validCoordinates(participant.location?.coordinates)
    )
    .map((participant) => {
      const coordinates = [
        Number(participant.location.coordinates.lng),
        Number(participant.location.coordinates.lat)
      ];

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: {
          id: participant.id,
          name: participant.id,
          layer: 'participants',
          description: `Trayectoria ${participant.informationStatus}`,
          color: mapColor('participants'),
          provisional: false
        }
      };
    });

  const activityFeatures = state.home.activities
    .filter((activity) =>
      validCoordinates(activity.location?.coordinates)
    )
    .map((activity) => {
      const coordinates = [
        Number(activity.location.coordinates.lng),
        Number(activity.location.coordinates.lat)
      ];

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: {
          id: activity.id,
          name: activity.title,
          layer: 'activities',
          description:
            `${activity.type} · ${activity.location.name || ''}`,
          color: mapColor('activities'),
          provisional: false
        }
      };
    });

  return {
    type: 'FeatureCollection',
    features: [
      ...directoryFeatures,
      ...participantFeatures,
      ...activityFeatures
    ],
    layers: [...layers, 'activities']
  };
}

function hideMapDetail() {
  window.clearTimeout(mapDetailHideTimer);

  const detail = $('#map-detail');

  if (detail) {
    detail.classList.add('hidden');
  }
}

function scheduleMapDetailHide() {
  window.clearTimeout(mapDetailHideTimer);

  mapDetailHideTimer = window.setTimeout(
    hideMapDetail,
    180
  );
}

function showMapDetail(properties) {
  window.clearTimeout(mapDetailHideTimer);

  const detail = $('#map-detail');

  if (!detail) {
    return;
  }

  detail.classList.remove('hidden');

  detail.innerHTML = `
    <button
      class="detail-close"
      aria-label="Cerrar detalle"
    >
      ×
    </button>

    <p class="eyebrow">
      ${escapeHtml(properties.layer)}
    </p>

    <h2>
      ${escapeHtml(properties.name)}
    </h2>

    <p>
      ${escapeHtml(properties.description)}
    </p>

    <small>
      ${
        properties.provisional
          ? 'Ubicación provisional: falta georreferenciar la dirección.'
          : 'Ubicación georreferenciada.'
      }
    </small>
  `;

  detail
    .querySelector('.detail-close')
    .addEventListener('click', (event) => {
      event.stopPropagation();
      hideMapDetail();
    });
}

function setupLayerPanel() {
  const panel = $('#map-controls-panel');

  if (!panel) {
    return;
  }

  const toggle = panel.querySelector(
    '.map-controls-toggle'
  );

  const content = panel.querySelector(
    '.map-layer-list'
  );

  if (!toggle || !content) {
    return;
  }

  const storageKey = 'daa-map-layers-open';
  const stored = localStorage.getItem(storageKey);
  const initiallyOpen = stored !== 'true';

  const setOpen = (open) => {
    panel.classList.toggle(
      'is-collapsed',
      !open
    );

    toggle.setAttribute(
      'aria-expanded',
      String(open)
    );

    toggle.querySelector(
      '.map-controls-icon'
    ).textContent = open ? '−' : '+';

    content.hidden = !open;

    localStorage.setItem(
      storageKey,
      String(open)
    );
  };

  toggle.addEventListener('click', () => {
    setOpen(
      panel.classList.contains('is-collapsed')
    );
  });

  setOpen(initiallyOpen);
}

function renderFallbackNodes() {
  const map = $('#ecosystem-map');

  if (!map) {
    return;
  }

  const message = document.createElement('div');

  message.className = 'map-unavailable';

  message.innerHTML = `
    <p class="eyebrow">
      Mapa no disponible
    </p>

    <strong>
      La representación geográfica requiere un mapa activo.
    </strong>

    <span>
      Los registros sin georreferenciación permanecen
      disponibles en el Directorio.
    </span>
  `;

  map.appendChild(message);
}

function renderMap() {
  $('#view-title').textContent = 'Mapa del ecosistema';

  $('#view').innerHTML = `
    <div class="map-screen">

      <div class="map-overlay map-copy">
        <p class="eyebrow">
          Capas nodales / zoom semántico
        </p>

        <h1>
          El territorio<br />
          <em>conectado.</em>
        </h1>

        <p>
          Acercate para descubrir la red.
        </p>
      </div>

      <div
        class="map-overlay map-controls"
        id="map-controls-panel"
      >
        <button
          class="map-controls-toggle"
          type="button"
          aria-expanded="true"
          aria-controls="map-layer-controls"
        >
          <span>Capas</span>
          <b class="map-controls-icon">−</b>
        </button>

        <div
          id="map-layer-controls"
          class="map-layer-list"
        ></div>
      </div>

      <div
        id="ecosystem-map"
        class="ecosystem-map"
      ></div>

      <aside
        id="map-detail"
        class="map-detail hidden"
      ></aside>

    </div>
  `;

  const data = mapFeatures();
  const controls = $('#map-layer-controls');

  data.layers
    .concat(['participants'])
    .forEach((layer) => {
      controls.insertAdjacentHTML(
        'beforeend',
        `
          <label>
            <input
              type="checkbox"
              checked
              data-map-layer="${layer}"
            />

            <i
              style="background:${mapColor(layer)}"
            ></i>

            ${layer}
          </label>
        `
      );
    });

  setupLayerPanel();

  const mapStyle = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#101b20'
        }
      },
      {
        id: 'osm',
        type: 'raster',
        source: 'osm',
        paint: {
          'raster-opacity': 0.18,
          'raster-saturation': -1,
          'raster-contrast': 0.2
        }
      }
    ]
  };

  const map = new maplibregl.Map({
    container: 'ecosystem-map',
    center: [-63.6, -35.5],
    zoom: 3.1,
    minZoom: 2.4,
    maxZoom: 12,
    style: mapStyle,
    attributionControl: false
  });

  window.setTimeout(() => {
    if (!map.isStyleLoaded()) {
      renderFallbackNodes();
    }
  }, 1200);

  map.addControl(
    new maplibregl.NavigationControl(),
    'bottom-right'
  );

  map.on('load', () => {
    map.addSource('ecosystem', {
      type: 'geojson',
      data,
      cluster: true,
      clusterMaxZoom: 7,
      clusterRadius: 48
    });

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'ecosystem',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#7770d8',
        'circle-opacity': 0.85,
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          18,
          20,
          25,
          80,
          32
        ],
        'circle-stroke-color': '#c9e86b',
        'circle-stroke-width': 1
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'ecosystem',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 11
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    map.addLayer({
      id: 'nodes',
      type: 'circle',
      source: 'ecosystem',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3,
          4,
          7,
          7,
          11,
          10
        ],
        'circle-blur': 0.15,
        'circle-opacity': 0.95,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1
      }
    });

    map.addLayer({
      id: 'node-labels',
      type: 'symbol',
      source: 'ecosystem',
      minzoom: 7,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.4],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#101b20',
        'text-halo-width': 2
      }
    });

    controls
      .querySelectorAll('input')
      .forEach((input) => {
        input.addEventListener('change', () => {
          const selected = [
            ...controls.querySelectorAll(
              'input:checked'
            )
          ].map(
            (item) => item.dataset.mapLayer
          );

          const filter = [
            'in',
            ['get', 'layer'],
            ['literal', selected]
          ];

          map.setFilter('nodes', filter);
          map.setFilter(
            'node-labels',
            filter
          );
        });
      });

    map.on(
      'mouseenter',
      'nodes',
      (event) => {
        map.getCanvas().style.cursor = 'pointer';

        if (event.features?.[0]) {
          showMapDetail(
            event.features[0].properties
          );
        }
      }
    );

    map.on(
      'mouseleave',
      'nodes',
      () => {
        map.getCanvas().style.cursor = '';
        scheduleMapDetailHide();
      }
    );

    map.on(
      'click',
      'nodes',
      (event) => {
        if (event.features?.[0]) {
          showMapDetail(
            event.features[0].properties
          );
        }
      }
    );

    map.on('click', () => {
      const detail = $('#map-detail');

      if (
        detail &&
        !detail.matches(':hover')
      ) {
        hideMapDetail();
      }
    });
  });
}

async function loadGoogleMaps() {
  const config = await api(
    '/api/maps-config'
  );

  if (!config.googleMapsApiKey) {
    return false;
  }

  if (window.google?.maps) {
    return true;
  }

  await new Promise((resolve, reject) => {
    const callback =
      `daaGoogleMapsReady_${Date.now()}`;

    window[callback] = resolve;

    const script =
      document.createElement('script');

    script.src =
      'https://maps.googleapis.com/maps/api/js' +
      `?key=${encodeURIComponent(config.googleMapsApiKey)}` +
      '&libraries=geometry' +
      `&callback=${callback}`;

    script.async = true;
    script.defer = true;
    script.onerror = reject;

    document.head.appendChild(script);
  });

  return Boolean(window.google?.maps);
}

function renderGoogleMap() {
  $('#view-title').textContent =
    'Mapa del ecosistema';

  $('#view').innerHTML = `
    <div class="map-screen google-map-screen">

      <div class="map-overlay map-copy">
        <p class="eyebrow">
          Capas nodales / zoom semántico
        </p>

        <h1>
          El territorio<br />
          <em>conectado.</em>
        </h1>

        <p>
          Acercate para descubrir la red.
        </p>
      </div>

      <div
        class="map-overlay map-controls"
        id="map-controls-panel"
      >
        <button
          class="map-controls-toggle"
          type="button"
          aria-expanded="true"
          aria-controls="map-layer-controls"
        >
          <span>Capas</span>
          <b class="map-controls-icon">−</b>
        </button>

        <div
          id="map-layer-controls"
          class="map-layer-list"
        ></div>
      </div>

      <div
        id="ecosystem-map"
        class="ecosystem-map"
      ></div>

      <aside
        id="map-detail"
        class="map-detail hidden"
      ></aside>

    </div>
  `;

  const data = mapFeatures();
  const controls = $('#map-layer-controls');

  data.layers
    .concat(['participants'])
    .forEach((layer) => {
      controls.insertAdjacentHTML(
        'beforeend',
        `
          <label>
            <input
              type="checkbox"
              checked
              data-map-layer="${layer}"
            />

            <i
              style="background:${mapColor(layer)}"
            ></i>

            ${layer}
          </label>
        `
      );
    });

  setupLayerPanel();

  loadGoogleMaps()
    .then((available) => {
      if (!available) {
        renderFallbackNodes();
        return;
      }

      const map = new google.maps.Map(
        $('#ecosystem-map'),
        {
          center: {
            lat: -35.5,
            lng: -63.6
          },
          zoom: 4,
          minZoom: 3,
          maxZoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,

          styles: [
            {
              elementType: 'geometry',
              stylers: [
                {
                  color: '#17212b'
                }
              ]
            },
            {
              elementType: 'labels.text.stroke',
              stylers: [
                {
                  color: '#17212b'
                }
              ]
            },
            {
              elementType: 'labels.text.fill',
              stylers: [
                {
                  color: '#9fb4c1'
                }
              ]
            },
            {
              featureType:
                'administrative.country',
              elementType:
                'geometry.stroke',
              stylers: [
                {
                  color: '#637482'
                }
              ]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#0e2638'
                }
              ]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [
                {
                  color: '#263744'
                }
              ]
            }
          ]
        }
      );

      class NodeOverlay
        extends google.maps.OverlayView {

        constructor(feature) {
          super();

          this.feature = feature;

          this.node =
            document.createElement('button');

          this.node.className =
            'google-node';

          this.node.dataset.layer =
            feature.properties.layer;

          this.node.title =
            feature.properties.name;

          this.node.style.setProperty(
            '--node-color',
            feature.properties.color
          );

          this.node.addEventListener(
            'mouseenter',
            () => {
              showMapDetail(
                feature.properties
              );
            }
          );

          this.node.addEventListener(
            'mouseleave',
            () => {
              scheduleMapDetailHide();
            }
          );

          this.node.addEventListener(
            'click',
            (event) => {
              event.stopPropagation();

              showMapDetail(
                feature.properties
              );
            }
          );
        }

        onAdd() {
          this.getPanes()
            .overlayMouseTarget
            .appendChild(this.node);
        }

        draw() {
          const projection =
            this.getProjection();

          const position =
            projection.fromLatLngToDivPixel(
              new google.maps.LatLng(
                this.feature.geometry.coordinates[1],
                this.feature.geometry.coordinates[0]
              )
            );

          this.node.style.left =
            `${position.x}px`;

          this.node.style.top =
            `${position.y}px`;
        }

        onRemove() {
          this.node.remove();
        }
      }

      const overlays =
        data.features.map((feature) => {
          const overlay =
            new NodeOverlay(feature);

          overlay.setMap(map);

          return overlay;
        });

      const updateVisibility = () => {
        const selected =
          new Set(
            [
              ...controls.querySelectorAll(
                'input:checked'
              )
            ].map(
              (input) =>
                input.dataset.mapLayer
            )
          );

        overlays.forEach((overlay) => {
          overlay.node.classList.toggle(
            'is-hidden',
            !selected.has(
              overlay.node.dataset.layer
            )
          );
        });
      };

      controls
        .querySelectorAll('input')
        .forEach((input) => {
          input.addEventListener(
            'change',
            updateVisibility
          );
        });

      map.addListener(
        'zoom_changed',
        () => {
          const compact =
            map.getZoom() < 5;

          $('#ecosystem-map')
            .classList
            .toggle(
              'map-compact',
              compact
            );
        }
      );

      map.addListener(
        'click',
        () => {
          const detail =
            $('#map-detail');

          if (
            detail &&
            !detail.matches(':hover')
          ) {
            hideMapDetail();
          }
        }
      );

      const mapScreen =
        $('.google-map-screen');

      mapScreen.addEventListener(
        'click',
        (event) => {
          if (
            !event.target.closest(
              '.google-node'
            ) &&
            !event.target.closest(
              '#map-detail'
            ) &&
            !event.target.closest(
              '#map-controls-panel'
            )
          ) {
            hideMapDetail();
          }
        }
      );

      updateVisibility();
    })
    .catch(() => {
      renderFallbackNodes();
    });
}

function directoryCard(node) {
  const layer = canonicalLayer(node);

  return `
    <article class="directory-card">
      <div>
        <span class="directory-layer">
          ${escapeHtml(layer)}
        </span>

        <h3>
          ${escapeHtml(node.name)}
        </h3>

        <p>
          ${escapeHtml(node.description || '')}
        </p>
      </div>

      <span
        class="directory-status"
        style="--node-color:${mapColor(layer)}"
      >
        ${escapeHtml(node.status || '')}
      </span>
    </article>
  `;
}

function filterDirectory() {
  const query =
    String(
      $('#directory-search')?.value || ''
    ).toLowerCase();

  document
    .querySelectorAll('.directory-card')
    .forEach((card) => {
      const visible =
        card.textContent
          .toLowerCase()
          .includes(query);

      card.classList.toggle(
        'is-hidden',
        !visible
      );
    });
}

function renderDirectory() {
  $('#view-title').textContent =
    'Directorio';

  $('#view').innerHTML = `
    <section class="directory-view">

      <div class="directory-header">
        <div>
          <p class="eyebrow">
            Ecosistema / Directorio
          </p>

          <h1>
            Actores del ecosistema.
          </h1>
        </div>

        <label class="directory-search">
          <span>⌕</span>

          <input
            id="directory-search"
            placeholder="Buscar actor..."
          />
        </label>
      </div>

      <div class="directory-list">
        ${state.home.directory
          .map(directoryCard)
          .join('')}
      </div>

    </section>
  `;

  $('#directory-search')
    .addEventListener(
      'input',
      filterDirectory
    );
}

function renderActivities() {
  $('#view-title').textContent =
    'Actividades';

  $('#view').innerHTML = `
    <section class="activities-view">

      <div class="activities-header">
        <p class="eyebrow">
          Ecosistema / Actividades
        </p>

        <h1>
          Lo que está<br />
          <em>por suceder.</em>
        </h1>
      </div>

      <div class="activities-list">
        ${state.home.activities
          .map(activityCard)
          .join('')}
      </div>

    </section>
  `;
}

function renderView(view = state.view) {
  state.view = view;

  document
    .querySelectorAll(
      '.nav-item[data-view]'
    )
    .forEach((item) => {
      item.classList.toggle(
        'active',
        item.dataset.view === view
      );
    });

  ({
    home: renderHome,
    map: renderGoogleMap,
    directory: renderDirectory,
    activities: renderActivities
  }[view] || renderGoogleMap)();
}

async function loadPlatform() {
  state.home = await api('/api/home');

  $('#login-view')
    .classList
    .add('hidden');

  $('#platform')
    .classList
    .remove('hidden');

  $('#account-label')
    .textContent =
    state.account.email;

  $('#role-badge')
    .textContent =
    state.account.role.toUpperCase();

  renderView();
}

$('#login-form')
  .addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();

      const form =
        new FormData(
          event.currentTarget
        );

      const email =
        String(form.get('email'));

      const account =
        accounts[email];

      if (
        !account ||
        account.password !==
          form.get('password')
      ) {
        $('#login-error')
          .textContent =
          'Credenciales inválidas';

        return;
      }

      state.account = {
        email,
        role: account.role
      };

      state.token =
        `frontend-${crypto.randomUUID()}`;

      localStorage.setItem(
        'daa-token',
        state.token
      );

      localStorage.setItem(
        'daa-account',
        JSON.stringify(
          state.account
        )
      );

      await loadPlatform();
    }
  );

document.addEventListener(
  'click',
  (event) => {
    const target =
      event.target.closest(
        '[data-view]'
      );

    if (target) {
      renderView(
        target.dataset.view
      );
    }
  }
);

$('#logout')
  .addEventListener(
    'click',
    () => {
      localStorage.removeItem(
        'daa-token'
      );

      localStorage.removeItem(
        'daa-account'
      );

      location.reload();
    }
  );

$('#refresh')
  .addEventListener(
    'click',
    loadPlatform
  );

if (state.token) {
  state.account =
    JSON.parse(
      localStorage.getItem(
        'daa-account'
      ) || 'null'
    );

  if (state.account) {
    loadPlatform();
  } else {
    localStorage.removeItem(
      'daa-token'
    );
  }
}