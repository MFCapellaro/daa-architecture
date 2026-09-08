const state = {
  home: null,
  account: null,
  token: localStorage.getItem('daa-token'),
  view: 'map'
};

const $ = (selector) =>
  document.querySelector(selector);

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

async function api(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(
      'No se pudo cargar la plataforma'
    );
  }

  return response.json();
}

function validCoordinates(value) {
  return (
    Number.isFinite(Number(value?.lng)) &&
    Number.isFinite(Number(value?.lat))
  );
}

function activityCard(activity) {
  const month =
    new Intl.DateTimeFormat('es-AR', {
      month: 'short'
    }).format(
      new Date(activity.startsAt)
    );

  return `
    <article class="activity-row">
      <div class="activity-date">
        <strong>
          ${new Date(activity.startsAt).getDate()}
        </strong>

        <span>
          ${month.toUpperCase()}
        </span>
      </div>

      <div>
        <strong>
          ${escapeHtml(activity.title)}
        </strong>

        <span>
          ${escapeHtml(activity.location)}
          ·
          ${activity.type}
        </span>
      </div>

      <b class="arrow">↗</b>
    </article>
  `;
}

function renderHome() {
  $('#view-title').textContent =
    'Inicio';

  $('#view').innerHTML = `
    <section class="home-view">

      <div class="home-intro">

        <p class="eyebrow">
          DRONSAIR / ECOSISTEMA
        </p>

        <h1>
          Una red que<br />
          <em>aprende con vos.</em>
        </h1>

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
      (item) =>
        aliases[item] ||
        knownLayers.includes(item)
    ) || '';

  return (
    aliases[layer] ||
    node.layers?.find(
      (item) =>
        knownLayers.includes(item)
    ) ||
    aliases[node.type] ||
    'organization'
  );
}

/* =========================================================
   MAP DATA
   ========================================================= */

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

  /*
   * IMPORTANTE:
   * Solo entran al mapa registros que tengan
   * coordenadas reales.
   *
   * No existe fallback geográfico.
   */

  const directoryFeatures =
    state.home.directory
      .filter((node) =>
        validCoordinates(
          node.location?.coordinates
        )
      )
      .map((node) => {
        const layer =
          canonicalLayer(node);

        const coordinates = [
          Number(
            node.location.coordinates.lng
          ),
          Number(
            node.location.coordinates.lat
          )
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
            description:
              `${node.type} · ${node.status}`,
            color: mapColor(layer),
            provisional: false
          }
        };
      });

  const participantFeatures =
    state.home.participants
      .filter((participant) =>
        validCoordinates(
          participant.location?.coordinates
        )
      )
      .map((participant) => {
        const coordinates = [
          Number(
            participant.location.coordinates.lng
          ),
          Number(
            participant.location.coordinates.lat
          )
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
            description:
              `Trayectoria ${participant.informationStatus}`,
            color: mapColor('participants'),
            provisional: false
          }
        };
      });

  const activityFeatures =
    state.home.activities
      .filter((activity) =>
        validCoordinates(
          activity.location?.coordinates
        )
      )
      .map((activity) => {
        const coordinates = [
          Number(
            activity.location.coordinates.lng
          ),
          Number(
            activity.location.coordinates.lat
          )
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
              `${activity.type} · ${
                activity.location.name || ''
              }`,
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

    layers: [
      ...layers,
      'activities'
    ]
  };
}

/* =========================================================
   LAYER PANEL
   ========================================================= */

function setupLayerPanel() {
  const panel =
    $('#map-controls-panel');

  if (!panel) {
    return;
  }

  const toggle =
    panel.querySelector(
      '.map-controls-toggle'
    );

  const content =
    panel.querySelector(
      '.map-layer-list'
    );

  if (!toggle || !content) {
    return;
  }

  const storageKey =
    'daa-map-layers-open';

  const stored =
    localStorage.getItem(
      storageKey
    );

  /*
   * Si nunca se guardó un estado,
   * CAPAS comienza cerrada.
   */
  const initiallyOpen =
    stored === 'true';

  const setOpen = (open) => {
    panel.classList.toggle(
      'is-collapsed',
      !open
    );

    toggle.setAttribute(
      'aria-expanded',
      String(open)
    );

    const icon =
      toggle.querySelector(
        '.map-controls-icon'
      );

    if (icon) {
      icon.textContent =
        open ? '−' : '+';
    }

    content.hidden = !open;

    localStorage.setItem(
      storageKey,
      String(open)
    );
  };

  toggle.addEventListener(
    'click',
    () => {
      setOpen(
        panel.classList.contains(
          'is-collapsed'
        )
      );
    }
  );

  setOpen(initiallyOpen);
}

/* =========================================================
   FALLBACK
   ========================================================= */

function renderFallbackNodes() {
  const map =
    $('#ecosystem-map');

  if (!map) {
    return;
  }

  const message =
    document.createElement('div');

  message.className =
    'map-unavailable';

  message.innerHTML = `
    <p class="eyebrow">
      Mapa no disponible
    </p>

    <strong>
      La representación geográfica requiere
      un mapa activo.
    </strong>

    <span>
      Los registros sin georreferenciación
      permanecen disponibles en el Directorio.
    </span>
  `;

  map.appendChild(message);
}

/* =========================================================
   DRONSAIR GRID
   ========================================================= */

const GRID_LEVELS = {
  territory: {
    minZoom: 0,
    diameter: 9,
    module: 18
  },

  region: {
    minZoom: 5,
    diameter: 21,
    module: 42
  },

  detail: {
    minZoom: 9,
    diameter: 27,
    module: 54
  }
};

class DronsairGridOverlay
  extends google.maps.OverlayView {

  constructor() {
    super();

    this.container =
      document.createElement('div');

    this.container.className =
      'dronsair-grid-overlay';

    this.grid =
      document.createElement('div');

    this.grid.className =
      'dronsair-grid';

    this.container.appendChild(
      this.grid
    );
  }

  onAdd() {
    this.getPanes()
      .overlayLayer
      .appendChild(
        this.container
      );

    this.update();
  }

  draw() {
    this.update();
  }

  update() {
    const map =
      this.getMap();

    if (!map) {
      return;
    }

    const zoom =
      map.getZoom() ?? 4;

    let level =
      GRID_LEVELS.territory;

    if (
      zoom >= GRID_LEVELS.detail.minZoom
    ) {
      level =
        GRID_LEVELS.detail;
    } else if (
      zoom >= GRID_LEVELS.region.minZoom
    ) {
      level =
        GRID_LEVELS.region;
    }

    this.grid.style.setProperty(
      '--grid-diameter',
      `${level.diameter}px`
    );

    this.grid.style.setProperty(
      '--grid-module',
      `${level.module}px`
    );
  }

  onRemove() {
    this.container.remove();
  }
}

/* =========================================================
   GOOGLE MAP
   ========================================================= */

async function loadGoogleMaps() {
  const config =
    await api('/api/maps-config');

  if (!config.googleMapsApiKey) {
    return false;
  }

  if (window.google?.maps) {
    return true;
  }

  await new Promise(
    (resolve, reject) => {
      const callback =
        `daaGoogleMapsReady_${Date.now()}`;

      window[callback] =
        resolve;

      const script =
        document.createElement(
          'script'
        );

      script.src =
        'https://maps.googleapis.com/maps/api/js' +
        `?key=${encodeURIComponent(
          config.googleMapsApiKey
        )}` +
        '&libraries=geometry' +
        `&callback=${callback}`;

      script.async = true;
      script.defer = true;
      script.onerror = reject;

      document.head.appendChild(
        script
      );
    }
  );

  return Boolean(
    window.google?.maps
  );
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
        class="map-overlay map-controls is-collapsed"
        id="map-controls-panel"
      >

        <button
          class="map-controls-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="map-layer-controls"
        >
          <span>Capas</span>
          <b class="map-controls-icon">+</b>
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

    </div>
  `;

  const data =
    mapFeatures();

  const controls =
    $('#map-layer-controls');

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

      const map =
        new google.maps.Map(
          $('#ecosystem-map'),
          {
            center: {
              lat: -35.5,
              lng: -63.6
            },

            zoom: 4,

            minZoom: 3,
            maxZoom: 16,

            /*
             * Conservamos el relieve
             * colorimétrico de Google.
             */
            mapTypeId: 'terrain',

            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false
          }
        );

      /* =====================================================
         DRONSAIR GRID
         ===================================================== */

      const gridOverlay =
        new DronsairGridOverlay();

      gridOverlay.setMap(map);

      map.addListener(
        'zoom_changed',
        () => {
          gridOverlay.update();

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

      /* =====================================================
         NODE OVERLAY
         ===================================================== */

      class NodeOverlay
        extends google.maps.OverlayView {

        constructor(feature) {
          super();

          this.feature =
            feature;

          this.hideTimer =
            null;

          this.node =
            document.createElement(
              'button'
            );

          this.node.className =
            'google-node';

          this.node.type =
            'button';

          this.node.dataset.layer =
            feature.properties.layer;

          this.node.title =
            feature.properties.name;

          this.node.style.setProperty(
            '--node-color',
            feature.properties.color
          );

          this.detail =
            document.createElement(
              'div'
            );

          this.detail.className =
            'google-node-detail hidden';

          this.detail.style.setProperty(
            '--node-color',
            feature.properties.color
          );

          this.detail.innerHTML = `
            <p class="eyebrow">
              ${escapeHtml(
                feature.properties.layer
              )}
            </p>

            <strong>
              ${escapeHtml(
                feature.properties.name
              )}
            </strong>

            <span>
              ${escapeHtml(
                feature.properties.description
              )}
            </span>
          `;

          /*
           * Desktop:
           * entrar al nodo abre.
           */
          this.node.addEventListener(
            'mouseenter',
            () => {
              this.showDetail();
            }
          );

          /*
           * Salir del nodo no cierra
           * inmediatamente.
           *
           * Esto permite pasar el cursor
           * desde el nodo hacia el detalle.
           */
          this.node.addEventListener(
            'mouseleave',
            () => {
              this.scheduleHide();
            }
          );

          /*
           * Mobile:
           * tap abre/cierra.
           */
          this.node.addEventListener(
            'click',
            (event) => {
              event.stopPropagation();

              if (
                this.detail.classList.contains(
                  'hidden'
                )
              ) {
                this.showDetail();
              } else {
                this.hideDetail();
              }
            }
          );

          /*
           * El detalle también forma parte
           * de la zona activa.
           */
          this.detail.addEventListener(
            'mouseenter',
            () => {
              this.showDetail();
            }
          );

          this.detail.addEventListener(
            'mouseleave',
            () => {
              this.scheduleHide();
            }
          );

          /*
           * El detalle no debe provocar
           * interacción con el mapa.
           */
          google.maps.OverlayView
            .preventMapHitsFrom(
              this.detail
            );
        }

        showDetail() {
          window.clearTimeout(
            this.hideTimer
          );

          this.detail.classList.remove(
            'hidden'
          );
        }

        hideDetail() {
          window.clearTimeout(
            this.hideTimer
          );

          this.detail.classList.add(
            'hidden'
          );
        }

        scheduleHide() {
          window.clearTimeout(
            this.hideTimer
          );

          this.hideTimer =
            window.setTimeout(
              () => {
                this.hideDetail();
              },
              180
            );
        }

        onAdd() {
          const panes =
            this.getPanes();

          panes
            .overlayMouseTarget
            .appendChild(
              this.node
            );

          panes
            .floatPane
            .appendChild(
              this.detail
            );
        }

        draw() {
          const projection =
            this.getProjection();

          if (!projection) {
            return;
          }

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

          /*
           * El detalle queda inmediatamente
           * al lado del nodo.
           */
          this.detail.style.left =
            `${position.x + 14}px`;

          this.detail.style.top =
            `${position.y - 12}px`;
        }

        onRemove() {
          window.clearTimeout(
            this.hideTimer
          );

          this.node.remove();
          this.detail.remove();
        }
      }

      const overlays =
        data.features.map(
          (feature) => {
            const overlay =
              new NodeOverlay(
                feature
              );

            overlay.setMap(map);

            return overlay;
          }
        );

      /* =====================================================
         VISIBILITY
         ===================================================== */

      const updateVisibility =
        () => {

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

          overlays.forEach(
            (overlay) => {

              const visible =
                selected.has(
                  overlay.node.dataset.layer
                );

              overlay.node.classList.toggle(
                'is-hidden',
                !visible
              );

              if (!visible) {
                overlay.hideDetail();
              }
            }
          );
        };

      controls
        .querySelectorAll('input')
        .forEach(
          (input) => {

            input.addEventListener(
              'change',
              updateVisibility
            );
          }
        );

      /* =====================================================
         CLICK OUTSIDE
         ===================================================== */

      map.addListener(
        'click',
        () => {
          overlays.forEach(
            (overlay) => {
              overlay.hideDetail();
            }
          );
        }
      );

      const mapScreen =
        $('.google-map-screen');

      mapScreen.addEventListener(
        'click',
        (event) => {

          if (
            event.target.closest(
              '.google-node'
            ) ||
            event.target.closest(
              '.google-node-detail'
            ) ||
            event.target.closest(
              '#map-controls-panel'
            )
          ) {
            return;
          }

          overlays.forEach(
            (overlay) => {
              overlay.hideDetail();
            }
          );
        }
      );

      updateVisibility();

      /*
       * Inicializamos la densidad
       * correspondiente al zoom inicial.
       */
      gridOverlay.update();

      $('#ecosystem-map')
        .classList
        .toggle(
          'map-compact',
          map.getZoom() < 5
        );
    })
    .catch(() => {
      renderFallbackNodes();
    });
}

/* =========================================================
   DIRECTORY
   ========================================================= */

function directoryCard(node) {
  const layer =
    canonicalLayer(node);

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
          ${escapeHtml(
            node.description || ''
          )}
        </p>

      </div>

      <span
        class="directory-status"
        style="--node-color:${mapColor(layer)}"
      >
        ${escapeHtml(
          node.status || ''
        )}
      </span>

    </article>
  `;
}

function filterDirectory() {
  const query =
    String(
      $('#directory-search')?.value ||
      ''
    ).toLowerCase();

  document
    .querySelectorAll(
      '.directory-card'
    )
    .forEach(
      (card) => {

        const visible =
          card.textContent
            .toLowerCase()
            .includes(query);

        card.classList.toggle(
          'is-hidden',
          !visible
        );
      }
    );
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

/* =========================================================
   ACTIVITIES
   ========================================================= */

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

/* =========================================================
   VIEW ROUTING
   ========================================================= */

function renderView(
  view = state.view
) {
  state.view = view;

  document
    .querySelectorAll(
      '.nav-item[data-view]'
    )
    .forEach(
      (item) => {

        item.classList.toggle(
          'active',
          item.dataset.view === view
        );
      }
    );

  ({
    home: renderHome,
    map: renderGoogleMap,
    directory: renderDirectory,
    activities: renderActivities
  }[view] || renderGoogleMap)();
}

/* =========================================================
   PLATFORM
   ========================================================= */

async function loadPlatform() {
  state.home =
    await api('/api/home');

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

/* =========================================================
   LOGIN
   ========================================================= */

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
        String(
          form.get('email')
        );

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

/* =========================================================
   NAVIGATION
   ========================================================= */

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

/* =========================================================
   LOGOUT
   ========================================================= */

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

/* =========================================================
   REFRESH
   ========================================================= */

$('#refresh')
  .addEventListener(
    'click',
    loadPlatform
  );

/* =========================================================
   RESTORE SESSION
   ========================================================= */

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