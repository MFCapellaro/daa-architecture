import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Category } from '../../types/category';
import { useAuth } from '../../context/AuthContext';
import './DirectoryPage.css';

interface Actor {
  id: string;
  name: string;
  primaryCategory?: string;
  categoryLabel?: string;
  description?: string;
  source?: { raw?: string };
  layers?: string[];
  contact?: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    whatsapp?: string | null;
  };
  location: {
    address?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    coordinates?: {
      latitude?: number | string | null;
      longitude?: number | string | null;
    } | null;
  };
  geolocation?: {
    latitude?: number | string | null;
    longitude?: number | string | null;
  };
  presence?: {
    website?: string;
  };
}

const getActorCategoryIds = (actor: Actor): string[] => {
  const layerIds = actor.layers?.filter(Boolean) ?? [];
  if (layerIds.length > 0) return [...new Set(layerIds)];
  const fallback = actor.primaryCategory ?? actor.categoryLabel;
  return fallback ? [fallback] : [];
};

const getActorAddress = (actor: Actor): string => [
  actor.location?.address ?? actor.contact?.address,
  actor.location?.city ?? actor.contact?.city,
  actor.location?.province ?? actor.contact?.province,
  actor.location?.country ?? actor.contact?.country,
].filter(Boolean).join(', ');

const getMapUrl = (actor: Actor): string | null => {
  const params = new URLSearchParams();
  const latitude = actor.geolocation?.latitude ?? actor.location?.coordinates?.latitude;
  const longitude = actor.geolocation?.longitude ?? actor.location?.coordinates?.longitude;
  const categoryIds = getActorCategoryIds(actor);

  if (latitude != null && longitude != null && String(latitude).trim() && String(longitude).trim()) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      params.set('lat', String(lat));
      params.set('lng', String(lng));
    }
  }

  if (!params.has('lat')) {
    const address = getActorAddress(actor);
    if (!address) return null;
    params.set('q', address);
  }
  categoryIds.forEach((id) => params.append('layer', id));
  return `/map?${params.toString()}`;
};

export const DirectoryPage: React.FC = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const focusedActorId = searchParams.get('actor');
  const [actors, setActors] = useState<Actor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para la categoría seleccionada y la búsqueda por texto
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
  const fetchActors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/actors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bear' + 'er ' + token } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 502) {
          throw new Error('No se pudo conectar con el servidor backend (502 Bad Gateway).');
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Error en el servidor: ${response.status}`);
      }
      const data: Actor[] = await response.json();
      setActors(data);
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) {
        throw new Error(`No se pudieron cargar las categorías (${categoriesResponse.status}).`);
      }
      const loadedCategories: Category[] = await categoriesResponse.json();
      setCategories(loadedCategories);
    } catch (err: any) {
      setError(err.message || 'Error cargando el directorio');
    } finally {
      setLoading(false);
    }
  };

  fetchActors();
}, [token]);

  useEffect(() => {
    const focusedActor = actors.find((actor) => actor.id === focusedActorId);
    if (!focusedActor) return;
    setSelectedCategory('all');
    setSearchTerm(focusedActor.name);
  }, [actors, focusedActorId]);

  // 1. Obtener lista de categorías únicas con su conteo para el menú
  const categoryStats = useMemo(() => {
    const stats = new Map<string, number>();
    const categoryOrder = new Map(categories.map((category, index) => [category.id, index]));
    actors.forEach((actor) => {
      getActorCategoryIds(actor).forEach((id) => {
        stats.set(id, (stats.get(id) ?? 0) + 1);
      });
    });

    return [...stats.entries()]
      .map(([id, count]) => ({
        id,
        name: categories.find((category) => category.id === id)?.name ?? id,
        count,
      }))
      .sort((left, right) =>
        (categoryOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER)
          - (categoryOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER)
        || left.name.localeCompare(right.name));
  }, [actors, categories]);

  // 2. Filtrar los actores por categoría y término de búsqueda
  const filteredActors = useMemo(() => {
    return actors.filter((actor) => {
      const matchesCategory =
        selectedCategory === 'all' || getActorCategoryIds(actor).includes(selectedCategory);

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        actor.name.toLowerCase().includes(term) ||
        (actor.description && actor.description.toLowerCase().includes(term)) ||
        (actor.location?.province && actor.location.province.toLowerCase().includes(term)) ||
        (actor.location?.city && actor.location.city.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [actors, selectedCategory, searchTerm]);

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  useEffect(() => {
    if (!focusedActorId || !filteredActors.some((actor) => actor.id === focusedActorId)) return;
    const animationFrame = window.requestAnimationFrame(() => {
      document.getElementById(`directory-actor-${focusedActorId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [filteredActors, focusedActorId]);

  if (loading) {
    return <div className="public-directory-state">Cargando directorio de actores...</div>;
  }

  if (error) {
    return <div className="public-directory-state public-directory-state--error">Error: {error}</div>;
  }

  return (
    <div className="public-directory">
      <aside className="public-directory-sidebar">
        <div className="public-directory-search">
          <label className="public-directory-label" htmlFor="directory-search">Buscar en el directorio</label>
          <input
            id="directory-search"
            type="search"
            placeholder="Nombre, ciudad o provincia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p>Limpiar búsqueda para activar los registros</p>
        </div>

        <h2 className="public-directory-category-title">Categorías</h2>
        <ul className="public-directory-category-list">
          <li>
            <button
              type="button"
              className={`public-directory-category${selectedCategory === 'all' ? ' is-active' : ''}`}
              aria-pressed={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              <span>Todas</span>
              <span className="public-directory-category-count">{actors.length}</span>
            </button>
          </li>
          {categoryStats.map(({ id, name, count }) => (
            <li key={id}>
              <button
                type="button"
                className={`public-directory-category${selectedCategory === id ? ' is-active' : ''}`}
                aria-pressed={selectedCategory === id}
                onClick={() => setSelectedCategory(id)}
              >
                <span>{name}</span>
                <span className="public-directory-category-count">{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="public-directory-main">
        <header className="public-directory-header">
          <h1>Directorio del Ecosistema</h1>
        </header>

        {filteredActors.length === 0 ? (
          <p className="public-directory-empty">No se encontraron actores para esta selección.</p>
        ) : (
          <div className="public-directory-grid">
            {filteredActors.map((actor) => {
              const categoryIds = getActorCategoryIds(actor);
              const address = getActorAddress(actor);
              const mapUrl = getMapUrl(actor);
              const description = actor.description?.trim()
                && actor.description.trim() !== actor.source?.raw?.trim()
                ? actor.description
                : null;
              const phoneHref = actor.contact?.phone?.replace(/[^\d+]/g, '');
              const whatsappNumber = actor.contact?.whatsapp?.replace(/\D/g, '');

              return (
              <div
                key={actor.id}
                id={`directory-actor-${actor.id}`}
                className={`public-directory-card${actor.id === focusedActorId ? ' is-focused' : ''}`}
              >
                <div>
                  <div className="public-directory-tags">
                    {categoryIds.length > 0 ? categoryIds.map((id) => (
                      <span key={id} className="public-directory-tag">
                        {categoryNameById.get(id) ?? id}
                      </span>
                    )) : (
                      <span className="public-directory-tag">
                        {actor.categoryLabel || 'Entidad'}
                      </span>
                    )}
                  </div>
                  <h3 className="public-directory-card-title">{actor.name}</h3>

                  {mapUrl && (
                    <div className="public-directory-location">
                      {address && <p>📍 {address}</p>}
                      <Link
                        to={mapUrl}
                        className="public-directory-map-link"
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
                          <path d="M9 3v15M15 6v15" />
                        </svg>
                        Ver en el mapa
                      </Link>
                    </div>
                  )}

                  {description && (
                    <p className="public-directory-description">
                      {description}
                    </p>
                  )}
                </div>

                <div className="public-directory-contact">
                  {actor.contact?.email && (
                    <a
                      href={`mailto:${actor.contact.email}`}
                      className="public-directory-contact-link"
                      aria-label={`Enviar correo a ${actor.name}: ${actor.contact.email}`}
                      title={actor.contact.email}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                    </a>
                  )}
                  {actor.contact?.phone && (
                    <a
                      href={`tel:${phoneHref}`}
                      className="public-directory-contact-link"
                      aria-label={`Llamar a ${actor.name}: ${actor.contact.phone}`}
                      title={actor.contact.phone}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 4h4l2 5-2.5 1.5a14 14 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1C10 20 4 14 4 5a1 1 0 0 1 1-1Z" />
                      </svg>
                    </a>
                  )}
                  {actor.contact?.whatsapp && whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Contactar por WhatsApp al ${actor.contact.whatsapp}`}
                      title={`WhatsApp: ${actor.contact.whatsapp}`}
                      className="public-directory-contact-link public-directory-whatsapp"
                    >
                      <svg aria-hidden="true" viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
                        <path d="M16 .8A15.1 15.1 0 0 0 3.05 23.67L1 31l7.5-1.97A15.1 15.1 0 1 0 16 .8Zm0 27.45c-2.35 0-4.65-.63-6.65-1.83l-.48-.28-4.45 1.17 1.19-4.34-.31-.5A12.3 12.3 0 1 1 16 28.25Zm6.75-9.22c-.37-.19-2.2-1.08-2.54-1.2-.34-.13-.59-.19-.83.18-.25.37-.96 1.2-1.18 1.45-.22.25-.43.28-.8.1-.37-.19-1.56-.58-2.97-1.84-1.1-.98-1.84-2.2-2.06-2.57-.22-.37-.02-.57.17-.76.17-.16.37-.43.55-.65.18-.22.24-.37.36-.62.12-.25.06-.46-.03-.65-.1-.18-.83-2-1.14-2.74-.3-.72-.6-.62-.82-.63h-.7c-.24 0-.64.09-.98.46-.34.37-1.29 1.26-1.29 3.08 0 1.81 1.32 3.57 1.5 3.81.19.25 2.6 3.96 6.3 5.55.88.38 1.57.61 2.1.78.88.28 1.68.24 2.31.15.7-.1 2.2-.9 2.51-1.78.3-.87.3-1.62.21-1.78-.09-.15-.34-.24-.71-.43Z" />
                      </svg>
                    </a>
                  )}
                  {actor.presence?.website && (
                    <a
                      href={actor.presence.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="public-directory-contact-link"
                      aria-label={`Sitio web de ${actor.name}`}
                      title={actor.presence.website}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};