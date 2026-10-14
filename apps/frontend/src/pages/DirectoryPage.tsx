import React, { useState, useEffect } from 'react';

export const DirectoryPage: React.FC = () => {
  const [actors, setActors] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/actors')
      .then((res) => res.json())
      .then((data) => setActors(data))
      .catch((err) => console.error('Error cargando actores públicos:', err));
  }, []);

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', margin: '0 0 8px 0', color: '#0f172a' }}>Directorio Público de Actores</h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Ecosistema de nodos y entidades DronsAir</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {actors.map((actor) => (
          <div key={actor.id} style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
              {actor.categoryLabel || 'Entidad'}
            </span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '16px' }}>{actor.name}</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{actor.description || 'Sin descripción disponible.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};