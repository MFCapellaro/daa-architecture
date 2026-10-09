import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Actor } from '../../types';

export const FrontendDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const navigate = useNavigate();

  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

  useEffect(() => {
    fetch('/api/actors?publicOnly=true')
      .then(res => res.json())
      .then(data => {
        setActors(data);
        if (data.length > 0) setSelectedActor(data[0]);
      })
      .catch(err => console.error('Error cargando lista:', err));
  }, []);

  return (
    <div style={{ background: '#0f0c1b', color: '#fff', minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr 380px' }}>
      
      {/* Panel Izquierdo: Menú de Navegación del Directorio */}
      <aside style={{ background: '#141022', padding: '1.5rem', borderRight: '1px solid #251d38' }}>
        <h4 style={{ color: '#9f7aea', letterSpacing: '1px' }}>DIRECTORIO</h4>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2', fontSize: '0.85rem', color: '#cbd5e0' }}>
          <li style={{ color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>• Drones & Agrícolas</li>
          <li style={{ paddingLeft: '1rem', cursor: 'pointer' }}>Dealers Oficiales</li>
          <li style={{ paddingLeft: '1rem', cursor: 'pointer' }}>Operadores Registrados</li>
          <li style={{ paddingLeft: '1rem', cursor: 'pointer' }}>Participantes</li>
          <li style={{ color: '#fff', fontWeight: 'bold', marginTop: '1rem', cursor: 'pointer' }}>• Actividades & Expos</li>
        </ul>
      </aside>

      {/* Panel Central: Lista Pública Mínima Limpia */}
      <main style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#f6ad55', marginBottom: '1.5rem' }}>Ecosistema de Drones Agrícolas</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {actors.map(actor => (
            <div 
              key={actor.id}
              onClick={() => setSelectedActor(actor)}
              style={{
                background: selectedActor?.id === actor.id ? '#251d38' : '#171226',
                border: '1px solid #2d2438',
                padding: '1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between', // Corregido: justifyContent
                alignItems: 'center'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff' }}>{actor.name}</h4>
                <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{actor.city}, {actor.province}</span>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#3182ce', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {actor.layers.join(' / ')}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Panel Derecho: Ficha Extendida + Vinculación con Mapa */}
      <aside style={{ background: '#141022', padding: '2rem', borderLeft: '1px solid #251d38' }}>
        {selectedActor && (
          <div>
            <h3 style={{ color: '#f6ad55', marginTop: 0 }}>{selectedActor.name}</h3>
            <p style={{ fontSize: '0.85rem', color: '#a0aec0' }}>{selectedActor.capabilities}</p>
            
            <hr style={{ borderColor: '#251d38', margin: '1.5rem 0' }} />

            {isAuthenticated ? (
              /* Datos Completos para Participante / Dealer Logueado */
              <div style={{ fontSize: '0.85rem', lineHeight: '1.8' }}>
                <p>📍 <strong>Dirección:</strong> {selectedActor.address}, {selectedActor.city}</p>
                <p>📞 <strong>Teléfono:</strong> {selectedActor.phone || 'No especificado'}</p>
                <p>✉️ <strong>Email:</strong> {selectedActor.email || 'No especificado'}</p>
                {selectedActor.website && (
                  <p>🌐 <strong>Web:</strong> <a href={selectedActor.website} target="_blank" rel="noreferrer" style={{ color: '#63b3ed' }}>{selectedActor.website}</a></p>
                )}
              </div>
            ) : (
              /* Datos Limitados para Visitante Público sin Sesión */
              <div style={{ background: '#221c33', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e0', margin: '0 0 0.75rem 0' }}>
                  Iniciá sesión como Participante o Dealer para acceder a los datos directos de contacto.
                </p>
                <button onClick={() => navigate('/login')} style={{ background: '#dd6b20', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Ingresar al Ecosistema
                </button>
              </div>
            )}

            {/* Enlace al Nodo del Mapa */}
            {selectedActor.latitude && (
              <button 
                onClick={() => navigate(`/mapa?actorId=${selectedActor.id}`)}
                style={{ width: '100%', marginTop: '2rem', background: '#38a169', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🗺️ Ver Nodo en el Mapa
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};