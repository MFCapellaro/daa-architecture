import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoUrl from '../../../logo/LogoWeb.png';

interface SystemNotification {
  id: string;
  category: 'actor' | 'pool' | 'activity';
  title: string;
  message: string;
  href: string;
  createdAt: string;
  readAt?: string;
}

export const Header: React.FC = () => {
  const { user, token, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/notifications', {
        headers: { Authorization: 'Bearer ' + token },
      });
      const result = await response.json() as SystemNotification[] | { message?: string };
      if (!response.ok) {
        throw new Error(!Array.isArray(result) ? result.message || 'No se pudieron cargar las notificaciones.' : 'No se pudieron cargar las notificaciones.');
      }
      if (!Array.isArray(result)) throw new Error('La respuesta de notificaciones no es válida.');
      setNotifications(result);
      setNotificationError(null);
    } catch (cause) {
      setNotificationError(cause instanceof Error ? cause.message : 'No se pudieron cargar las notificaciones.');
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    void loadNotifications();
    const timer = window.setInterval(() => void loadNotifications(), 60_000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, loadNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="site-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: '64px',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div className="brand" style={{ display: 'flex', flex: '0 0 auto', alignItems: 'center', justifyContent: 'center' }}>
        <Link
          to="/map"
          aria-label="DronsAir Ecosistema"
          style={{ display: 'flex', flex: '0 0 auto', alignItems: 'center', justifyContent: 'center' }}
        >
          <img
            src={logoUrl}
            alt="DronsAir"
            style={{
              display: 'block',
              flex: '0 0 auto',
              height: '55px',
              width: 'auto',
              maxWidth: 'min(100%, 360px)',
              objectFit: 'contain',
            }}
          />
        </Link>
      </div>

      {(isActive('/map') || isActive('/mapa')) && (
        <div
          id="map-header-search-slot"
          className="map-header-search-slot"
          style={{ position: 'relative', flex: '1 1 280px', minWidth: '160px', maxWidth: '360px', margin: '0 20px' }}
        />
      )}

      {/* Navegación por Perfil */}
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {/* Vista Pública */}
        <Link to="/directory" style={{ color: isActive('/directory') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" />
              <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h8" />
            </svg>
            Directorio
          </span>
        </Link>
        <Link to="/map" style={{ color: isActive('/map') || isActive('/mapa') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z" />
            </svg>
            Mapa Satelital
          </span>
        </Link>
        <Link to="/activities" style={{ color: isActive('/activities') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          Actividades
        </Link>
        <Link to="/pools" style={{ color: isActive('/pools') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          Pools
        </Link>

        {/* Backoffice Exclusivo Admin */}
        {isAuthenticated && user?.role === 'admin' && (
          <div style={{ display: 'flex', gap: '18px', borderLeft: '1px solid #334155', paddingLeft: '18px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.5px' }}>Backoffice:</span>
            <Link to="/admin/directory" style={{ color: isActive('/admin/directory') ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              ⚙️ ABM Directorio
            </Link>
            <Link to="/admin/participants" style={{ color: isActive('/admin/participants') ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              👥 Participantes
            </Link>
            <Link to="/admin/activities" style={{ color: isActive('/admin/activities') ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              📋 Actividades
            </Link>
            <Link to="/admin/pools" style={{ color: isActive('/admin/pools') ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              Pools
            </Link>
            <Link to="/admin/actors/submissions" style={{ color: isActive('/admin/actors/submissions') ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              Actores
            </Link>
            <Link to="/admin/notifications" style={{ color: isActive('/admin/notifications') ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              Notificaciones
            </Link>
          </div>
        )}
      </nav>

      {/* Estado del Usuario / Botón Salir */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                aria-label="Notificaciones"
                title="Notificaciones"
                onClick={() => {
                  const opening = !notificationsOpen;
                  setNotificationsOpen(opening);
                  if (opening) void loadNotifications();
                }}
                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155', borderRadius: '50%', padding: 8, color: '#cbd5e1', background: 'transparent', cursor: 'pointer' }}
              >
                <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                </svg>
                {notifications.some((notification) => !notification.readAt) && (
                  <span aria-label="Notificaciones sin leer" style={{ position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: '50%', background: '#38bdf8', border: '2px solid #0f172a' }} />
                )}
              </button>
              {notificationsOpen && (
                <div style={{ position: 'absolute', zIndex: 30, top: 'calc(100% + 12px)', right: 0, width: 340, maxHeight: 420, overflowY: 'auto', padding: 12, border: '1px solid #334155', borderRadius: 10, background: '#111827', boxShadow: '0 16px 36px rgba(0,0,0,.35)' }}>
                  <strong style={{ display: 'block', margin: '2px 4px 10px', fontSize: 14 }}>Notificaciones</strong>
                  {notificationError && <p role="alert" style={{ color: '#fca5a5', fontSize: 12 }}>{notificationError}</p>}
                  {!notificationError && notifications.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No tienes notificaciones.</p>}
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={async () => {
                        if (!notification.readAt && token) {
                          try {
                            const response = await fetch(`/api/notifications/${encodeURIComponent(notification.id)}/read`, {
                              method: 'PATCH',
                              headers: { Authorization: 'Bearer ' + token },
                            });
                            if (!response.ok) throw new Error(`No se pudo marcar la notificación como leída (${response.status}).`);
                          } catch (cause) {
                            setNotificationError(cause instanceof Error ? cause.message : 'No se pudo marcar la notificación como leída.');
                            return;
                          }
                        }
                        setNotifications((current) => current.map((item) => item.id === notification.id
                          ? { ...item, readAt: item.readAt || new Date().toISOString() }
                          : item));
                        setNotificationsOpen(false);
                        navigate(notification.href);
                      }}
                      style={{ display: 'block', width: '100%', padding: '10px 8px', border: 0, borderTop: '1px solid #263244', color: '#e2e8f0', background: notification.readAt ? 'transparent' : '#17263a', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, fontWeight: 700 }}>
                        {notification.title}
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>{notification.category}</span>
                      </span>
                      <span style={{ display: 'block', marginTop: 4, color: '#aeb9c9', fontSize: 12, lineHeight: 1.4 }}>{notification.message}</span>
                    </button>
                  ))}
                  <Link to="/admin/notifications" onClick={() => setNotificationsOpen(false)} style={{ display: user?.role === 'admin' ? 'block' : 'none', padding: '10px 8px', color: '#7dd3fc', fontSize: 12 }}>
                    Ver todas
                  </Link>
                </div>
              )}
            </div>
            {(user?.role === 'participante' || user?.role === 'dealer') ? (
              <Link to="/portal" aria-label="Mi Perfil" title="Mi Perfil" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc', textDecoration: 'none' }}>
                {user.profile?.avatar
                  ? <img src={user.profile.avatar} alt="" aria-hidden="true" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                  : <span aria-hidden="true" style={{ display: 'grid', width: 30, height: 30, placeItems: 'center', borderRadius: '50%', background: '#334155', fontSize: 12 }}>{user?.name?.charAt(0).toUpperCase()}</span>}
                <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
              </Link>
            ) : (
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user?.name}</div>
            )}
            <button
              onClick={handleLogout}
              type="button"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: 8,
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v10" />
                <path d="M6.2 5.8a8 8 0 1 0 11.6 0" />
              </svg>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
};