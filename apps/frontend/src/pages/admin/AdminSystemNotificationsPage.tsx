import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SystemNotification {
  id: string;
  category: 'actor' | 'pool' | 'activity';
  title: string;
  message: string;
  href: string;
  entityId: string;
  createdAt: string;
  readAt?: string;
}

const categoryLinks = { actor: '/admin/actors/submissions', pool: '/admin/pools', activity: '/admin/activities' };
const categoryLabels = { actor: 'Actores', pool: 'Pools', activity: 'Actividades' };

export const AdminSystemNotificationsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) throw new Error('La sesión administrativa expiró. Inicia sesión nuevamente.');
    const response = await fetch('/api/notifications', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const result = await response.json() as SystemNotification[] | { message?: string };
    if (response.status === 401) {
      logout();
      throw new Error('La sesión administrativa expiró. Inicia sesión nuevamente.');
    }
    if (!response.ok) throw new Error(!Array.isArray(result) ? result.message || 'No se pudieron cargar las notificaciones.' : 'No se pudieron cargar las notificaciones.');
    if (!Array.isArray(result)) throw new Error('La respuesta de notificaciones no es válida.');
    setNotifications(result);
  }, [token, logout]);

  useEffect(() => {
    let active = true;
    void load().catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las notificaciones.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);

  const openNotification = async (notification: SystemNotification) => {
    if (!notification.readAt && token) {
      try {
        const response = await fetch(`/api/notifications/${encodeURIComponent(notification.id)}/read`, {
          method: 'PATCH',
          headers: { Authorization: 'Bearer ' + token },
        });
        if (!response.ok) throw new Error(`No se pudo marcar como leída (${response.status}).`);
        setNotifications((current) => current.map((item) => item.id === notification.id
          ? { ...item, readAt: new Date().toISOString() }
          : item));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo marcar la notificación como leída.');
        return;
      }
    }
    navigate(notification.href);
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', padding: 32, color: '#e5e7eb', background: '#101114' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0, fontSize: 28, fontWeight: 600 }}>Notificaciones del sistema</h1>
        <p style={{ color: '#9ca3af' }}>Avisos de revisión de actores, Pools y actividades.</p>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          {Object.entries(categoryLinks).map(([category, href]) => <Link key={category} to={href} style={{ color: '#7dd3fc' }}>{categoryLabels[category as keyof typeof categoryLabels]}</Link>)}
        </nav>
        {error && <p role="alert" style={{ color: '#fca5a5' }}>{error}</p>}
        {loading ? <p>Cargando notificaciones…</p> : notifications.length === 0
          ? <p style={{ color: '#9ca3af' }}>No hay notificaciones del sistema.</p>
          : <div style={{ display: 'grid', gap: 10 }}>
            {notifications.map((notification) => (
              <button key={notification.id} type="button" onClick={() => void openNotification(notification)} style={{ width: '100%', padding: 16, border: '1px solid #2b2e35', borderRadius: 9, color: '#e5e7eb', background: notification.readAt ? '#17181c' : '#17263a', textAlign: 'left', cursor: 'pointer' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong>{notification.title}</strong>
                  <span style={{ color: '#7dd3fc', fontSize: 12 }}>{categoryLabels[notification.category]}</span>
                </span>
                <span style={{ display: 'block', marginTop: 7, color: '#b8c0cc', fontSize: 13 }}>{notification.message}</span>
                <span style={{ display: 'block', marginTop: 7, color: '#7c8492', fontSize: 11 }}>{new Date(notification.createdAt).toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>}
      </div>
    </main>
  );
};
