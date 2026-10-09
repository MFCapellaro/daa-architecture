import React, { useState, useEffect } from 'react';

interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'participante' | 'dealer';
  status: 'activo' | 'inactivo';
}

export const AdminParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar la lista de participantes desde la API protegida de Admin
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/participants', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setParticipants(data);
        }
      } catch (err) {
        console.error('Error cargando participantes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', margin: 0 }}>Gestión de Participantes y Dealers</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
            Panel de control para edición de usuarios del ecosistema
          </p>
        </div>
        <button
          style={{
            backgroundColor: '#16a34a',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + Nuevo Participante
        </button>
      </div>

      {loading ? (
        <div>Cargando participantes...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '13px', color: '#475569' }}>
              <th style={{ padding: '12px 16px' }}>Nombre</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Rol</th>
              <th style={{ padding: '12px 16px' }}>Estado</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: p.role === 'dealer' ? '#fef3c7' : '#e0f2fe',
                    color: p.role === 'dealer' ? '#92400e' : '#0369a1'
                  }}>
                    {p.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: p.status === 'activo' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button style={{ marginRight: '8px', border: '1px solid #cbd5e1', background: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                    ✏️ Editar
                  </button>
                  <button style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};