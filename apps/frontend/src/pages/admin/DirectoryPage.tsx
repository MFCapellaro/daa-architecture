import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Category } from '../../types/category';

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

      const token = localStorage.getItem('token');

      const response = await fetch('/api/actors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
}, []);

  useEffect(() => {
    const focusedActor = actors.find((actor) => actor.id === focusedActorId);
    if (!focusedActor) return;
    setSelectedCategory('all');
    setSearchTerm(focusedActor.name);
  }, [actors, focusedActorId]);

  // 1. Obtener lista de categorías únicas con su conteo para el menú
  const categoryStats = useMemo(() => {
    const stats = new Map<string, number>();
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
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
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
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando directorio de actores...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* MENÚ LATERAL: Filtros por Categoría */}
      <aside style={{ width: '280px', flexShrink: 0 }}>
        <h3>Categorías</h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: selectedCategory === 'all' ? '#2563eb' : '#fff',
                color: selectedCategory === 'all' ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: selectedCategory === 'all' ? 'bold' : 'normal',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Todas</span>
              <span>({actors.length})</span>
            </button>
          </li>
          {categoryStats.map(({ id, name, count }) => (
            <li key={id}>
              <button
                onClick={() => setSelectedCategory(id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  backgroundColor: selectedCategory === id ? '#2563eb' : '#fff',
                  color: selectedCategory === id ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === id ? 'bold' : 'normal',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{name}</span>
                <span style={{ opacity: 0.8, fontSize: '0.85em' }}>({count})</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ÁREA PRINCIPAL: Buscador y Grilla de Actores */}
      <main style={{ flexGrow: 1 }}>
        <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>Directorio del Ecosistema</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666' }}>
              Mostrando {filteredActors.length} de {actors.length} entidades
            </p>
          </div>

          {/* Campo de búsqueda */}
          <input
            type="text"
            placeholder="Buscar por nombre, ciudad o provincia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              width: '320px',
              fontSize: '0.95rem',
            }}
          />
        </header>

        {/* Grilla de Tarjetas */}
        {filteredActors.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No se encontraron actores para esta selección.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
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
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.2rem',
                  backgroundColor: '#fff',
                  outline: actor.id === focusedActorId ? '2px solid #2563eb' : undefined,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.5rem' }}>
                    {categoryIds.length > 0 ? categoryIds.map((id) => (
                      <span
                        key={id}
                        style={{
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                        }}
                      >
                        {categoryNameById.get(id) ?? id}
                      </span>
                    )) : (
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                      }}>
                        {actor.categoryLabel || 'Entidad'}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{actor.name}</h3>

                  {mapUrl && (
                    <div style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280' }}>
                      {address && <p style={{ margin: '0 0 0.25rem 0' }}>📍 {address}</p>}
                      <Link
                        to={mapUrl}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
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
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: '#4b5563',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {description}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid #f3f4f6' }}>
                  {actor.contact?.email && (
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#374151' }}>
                      ✉️ <a href={`mailto:${actor.contact.email}`}>{actor.contact.email}</a>
                    </p>
                  )}
                  {actor.contact?.phone && (
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#374151' }}>
                      📞 <a href={`tel:${phoneHref}`}>{actor.contact.phone}</a>
                    </p>
                  )}
                  {actor.contact?.whatsapp && whatsappNumber && (
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#374151' }}>
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Contactar por WhatsApp al ${actor.contact.whatsapp}`}
                        title={`WhatsApp: ${actor.contact.whatsapp}`}
                        style={{ display: 'inline-flex', alignItems: 'center', color: '#25D366' }}
                      >
                        <svg aria-hidden="true" viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
                          <path d="M16 .8A15.1 15.1 0 0 0 3.05 23.67L1 31l7.5-1.97A15.1 15.1 0 1 0 16 .8Zm0 27.45c-2.35 0-4.65-.63-6.65-1.83l-.48-.28-4.45 1.17 1.19-4.34-.31-.5A12.3 12.3 0 1 1 16 28.25Zm6.75-9.22c-.37-.19-2.2-1.08-2.54-1.2-.34-.13-.59-.19-.83.18-.25.37-.96 1.2-1.18 1.45-.22.25-.43.28-.8.1-.37-.19-1.56-.58-2.97-1.84-1.1-.98-1.84-2.2-2.06-2.57-.22-.37-.02-.57.17-.76.17-.16.37-.43.55-.65.18-.22.24-.37.36-.62.12-.25.06-.46-.03-.65-.1-.18-.83-2-1.14-2.74-.3-.72-.6-.62-.82-.63h-.7c-.24 0-.64.09-.98.46-.34.37-1.29 1.26-1.29 3.08 0 1.81 1.32 3.57 1.5 3.81.19.25 2.6 3.96 6.3 5.55.88.38 1.57.61 2.1.78.88.28 1.68.24 2.31.15.7-.1 2.2-.9 2.51-1.78.3-.87.3-1.62.21-1.78-.09-.15-.34-.24-.71-.43Z" />
                        </svg>
                      </a>
                    </p>
                  )}
                  {actor.presence?.website && (
                    <a
                      href={actor.presence.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginTop: '0.4rem' }}
                    >
                      🌐 Sitio web →
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