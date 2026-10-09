import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Actor } from '../../types';

export const FrontendMapaPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetActorId = searchParams.get('actorId');

  const [actors, setActors] = useState<Actor[]>([]);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    Dealers: true,
    Operators: true,
    Participants: true,
    Activities: true,
  });

  const [selectedNode, setSelectedNode] = useState<Actor | null>(null);

  useEffect(() => {
    fetch('/api/actors?publicOnly=true')
      .then(res => res.json())
      .then(data => {
        setActors(data.filter((a: Actor) => a.latitude && a.longitude));
        if (targetActorId) {
          const found = data.find((a: Actor) => a.id === targetActorId);
          if (found) setSelectedNode(found);
        }
      })
      .catch(err => console.error('Error cargando mapa:', err));
  }, [targetActorId]);

  const toggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 60px)', background: '#090a0f', overflow: 'hidden' }}>
      
      {/* Fondo Simulación Mapa Satelital */}
      <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, #1a202c 0%, #090a0f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        <div style={{ position: 'absolute', top: '10%', left: '5%', color: '#fff', pointerEvents: 'none' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, opacity: 0.9 }}>El territorio conectado.</h1>
          <p style={{ color: '#a0aec0' }}>Acercate para descubrir la red nodal de drones agrícolas.</p>
        </div>

        {/* Nodos/Pins Interactivos en el Mapa */}
        {actors.map(actor => (
          <div
            key={actor.id}
            onClick={() => setSelectedNode(actor)}
            style={{
              position: 'absolute',
              top: `${50 + (actor.latitude || 0) * 2}%`,
              left: `${60 + (actor.longitude || 0) * 2}%`,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: selectedNode?.id === actor.id ? '#f6ad55' : '#48bb78',
              boxShadow: '0 0 12px #48bb78',
              cursor: 'pointer',
              border: '2px solid #fff',
              transition: 'transform 0.2s'
            }}
          />
        ))}

        {/* Popup al Seleccionar Nodo */}
        {selectedNode && (
          <div style={{ position: 'absolute', bottom: '15%', left: '5%', background: '#17131f', padding: '1.25rem', borderRadius: '8px', border: '1px solid #38a169', width: '300px', color: '#fff' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#f6ad55' }}>{selectedNode.name}</h4>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e0', margin: '0 0 1rem 0' }}>{selectedNode.city}, {selectedNode.province}</p>
            <button 
              onClick={() => navigate(`/directorio?actorId=${selectedNode.id}`)}
              style={{ width: '100%', background: '#3182ce', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              📋 Ver Ficha en Directorio
            </button>
          </div>
        )}
      </div>

      {/* Control Lateral Derecho: Panel de Capas */}
      <aside style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(20, 16, 34, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #2d2438', padding: '1rem', borderRadius: '8px', color: '#fff', width: '180px', fontSize: '0.8rem' }}>
        <div style={{ fontWeight: 'bold', color: '#cbd5e0', marginBottom: '0.75rem', borderBottom: '1px solid #2d2438', paddingBottom: '0.25rem' }}>CAPAS</div>
        {Object.keys(activeLayers).map(layer => (
          <label key={layer} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={activeLayers[layer]} 
              onChange={() => toggleLayer(layer)}
            />
            {layer}
          </label>
        ))}
      </aside>
    </div>
  );
};