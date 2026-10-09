import React, { useState } from 'react';

interface Activity {
  id: string;
  title: string;
  date: string;
  status: 'Programada' | 'En Curso' | 'Finalizada';
}

export const AdminActivitiesPage: React.FC = () => {
  const [activities] = useState<Activity[]>([
    { id: '1', title: 'Monitoreo Agrícola Sector Sur', date: '2026-10-15', status: 'Programada' },
    { id: '2', title: 'Inspección Térmica de Infraestructura', date: '2026-11-02', status: 'Programada' },
  ]);

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', margin: 0, color: '#0f172a' }}>Gestión de Actividades</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Administración de tareas y eventos del ecosistema</p>
        </div>
        <button style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
          + Nueva Actividad
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '13px', color: '#475569' }}>
            <th style={{ padding: '12px 16px' }}>Título de Actividad</th>
            <th style={{ padding: '12px 16px' }}>Fecha</th>
            <th style={{ padding: '12px 16px' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => (
            <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
              <td style={{ padding: '12px 16px', fontWeight: 500 }}>{a.title}</td>
              <td style={{ padding: '12px 16px', color: '#64748b' }}>{a.date}</td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};