import React from 'react';
import { useAuth, User } from '../context/AuthContext';

interface UserDashboardProps {
  user?: User | null;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user: propUser }) => {
  const { user: contextUser } = useAuth();
  const user = propUser || contextUser;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#0f172a' }}>
          Panel de Usuario ({user?.role})
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Bienvenido, {user?.name || user?.email}
        </p>
      </div>
    </div>
  );
};