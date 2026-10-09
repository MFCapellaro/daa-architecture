import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const UserPortalPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#0f172a' }}>
          ¡Bienvenido, {user?.name || 'Usuario'}!
        </h1>
        <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '14px' }}>
          Portal Privado de {user?.role === 'dealer' ? 'Dealer Commercial' : 'Participante del Ecosistema'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>👤 Perfil Registrado</h3>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}><strong>Email:</strong> {user?.email}</p>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}><strong>Rol:</strong> {user?.role}</p>
          </div>

          <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>📋 Mis Actividades</h3>
            <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>No tienes actividades pendientes asignadas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};