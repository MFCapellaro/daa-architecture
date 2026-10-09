import React, { useState, useEffect, useMemo } from 'react';

export interface Actor {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  primaryCategory: string;
  categoryLabel: string;
  description: string;
  layers: string[];
  translatedLayers: string[];
  isPublic: boolean;
  status: string;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
    whatsapp: string | null;
  };
  location: {
    address: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
  };
  presence?: {
    website?: string;
  };
}

export const DirectoryPage: React.FC = () => {
  const [actors, setActors] = useState<Actor[]>([]);
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
    } catch (err: any) {
      setError(err.message || 'Error cargando el directorio');
    } finally {
      setLoading(false);
    }
  };

  fetchActors();
}, []);

  // 1. Obtener lista de categorías únicas con su conteo para el menú
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    actors.forEach((actor) => {
      const label = actor.categoryLabel || 'Otros';
      stats[label] = (stats[label] || 0) + 1;
    });

    // Convertir a lista ordenada de mayor a menor presencia
    return Object.entries(stats)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [actors]);

  // 2. Filtrar los actores por categoría y término de búsqueda
  const filteredActors = useMemo(() => {
    return actors.filter((actor) => {
      const matchesCategory =
        selectedCategory === 'all' || actor.categoryLabel === selectedCategory;

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
          {categoryStats.map(({ label, count }) => (
            <li key={label}>
              <button
                onClick={() => setSelectedCategory(label)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  backgroundColor: selectedCategory === label ? '#2563eb' : '#fff',
                  color: selectedCategory === label ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === label ? 'bold' : 'normal',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{label}</span>
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
            {filteredActors.map((actor) => (
              <div
                key={actor.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.2rem',
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {actor.categoryLabel}
                  </span>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{actor.name}</h3>

                  {actor.location?.province && (
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280' }}>
                      📍 {actor.location.city ? `${actor.location.city}, ` : ''}{actor.location.province}
                    </p>
                  )}

                  {actor.description && (
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
                      {actor.description}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid #f3f4f6' }}>
                  {actor.contact?.email && (
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#374151' }}>
                      ✉️ {actor.contact.email}
                    </p>
                  )}
                  {actor.contact?.phone && (
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#374151' }}>
                      📞 {actor.contact.phone}
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
};