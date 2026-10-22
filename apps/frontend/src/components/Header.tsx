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

type HeaderIconName = 'book' | 'compass' | 'calendar' | 'pool' | 'directory' | 'users'
  | 'activity' | 'bell' | 'power' | 'login' | 'user';

const HeaderIcon: React.FC<{ name: HeaderIconName }> = ({ name }) => (
  <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {name === 'book' && <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h8" /></>}
    {name === 'compass' && <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z" /></>}
    {name === 'calendar' && <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2" /></>}
    {name === 'pool' && <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>}
    {name === 'directory' && <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M6 16c.7-2 5.3-2 6 0M14 9h4M14 13h4M14 17h4" /></>}
    {name === 'users' && <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 2-6 6-6s6 2 6 6M16 5a3 3 0 0 1 0 6M18 14c2 .5 3 2.5 3 6" /></>}
    {name === 'activity' && <><path d="M4 5h16M4 9h16M4 13h9M4 17h9" /><path d="m17 16 2 2 4-5" /></>}
    {name === 'bell' && <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>}
    {name === 'power' && <><path d="M12 2v10" /><path d="M6.2 5.8a8 8 0 1 0 11.6 0" /></>}
    {name === 'login' && <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>}
    {name === 'user' && <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3-7 8-7s8 3 8 7" /></>}
  </svg>
);

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

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid ' + (active ? '#155e75' : '#334155'),
    borderRadius: 9,
    color: active ? '#38bdf8' : '#cbd5e1',
    textDecoration: 'none',
  });

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
      <nav aria-label="Navegación principal" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {/* Vista Pública */}
        <Link to="/directory" aria-label="Directorio" title="Directorio" style={navLinkStyle(isActive('/directory'))}>
          <HeaderIcon name="book" />
        </Link>
        <Link to="/map" aria-label="Mapa Satelital" title="Mapa Satelital" style={navLinkStyle(isActive('/map') || isActive('/mapa'))}>
          <HeaderIcon name="compass" />
        </Link>
        <Link to="/activities" aria-label="Actividades" title="Actividades" style={navLinkStyle(isActive('/activities'))}>
          <HeaderIcon name="calendar" />
        </Link>
        <Link to="/pools" aria-label="Pools" title="Pools" style={navLinkStyle(isActive('/pools'))}>
          <HeaderIcon name="pool" />
        </Link>

        {/* Backoffice Exclusivo Admin */}
        {isAuthenticated && user?.role === 'admin' && (
          <div aria-label="BackOffice" style={{ display: 'flex', gap: 8, borderLeft: '1px solid #334155', paddingLeft: 12, alignItems: 'center' }}>
            <Link to="/admin/directory" aria-label="ABM Directorio" title="ABM Directorio" style={navLinkStyle(isActive('/admin/directory'))}>
              <HeaderIcon name="directory" />
            </Link>
            <Link to="/admin/participants" aria-label="Participantes y Dealers" title="Participantes y Dealers" style={navLinkStyle(isActive('/admin/participants'))}>
              <HeaderIcon name="users" />
            </Link>
            <Link to="/admin/activities" aria-label="Actividades" title="Actividades" style={navLinkStyle(isActive('/admin/activities'))}>
              <HeaderIcon name="activity" />
            </Link>
            <Link to="/admin/pools" aria-label="Pools" title="Pools" style={navLinkStyle(isActive('/admin/pools'))}>
              <HeaderIcon name="pool" />
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
                <HeaderIcon name="bell" />
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
                </div>
              )}
            </div>
            {(user?.role === 'participante' || user?.role === 'dealer') ? (
              <Link to="/portal" aria-label="Mi Perfil" title="Mi Perfil" style={{ display: 'flex', alignItems: 'center', color: '#f8fafc', textDecoration: 'none' }}>
                {user.profile?.avatar
                  ? <img src={user.profile.avatar} alt="" aria-hidden="true" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                  : <span aria-hidden="true" style={{ display: 'grid', width: 30, height: 30, placeItems: 'center', borderRadius: '50%', background: '#334155', fontSize: 12 }}>{user?.name?.charAt(0).toUpperCase()}</span>}
              </Link>
            ) : (
              <span title={user?.name} aria-label={user?.name} style={{ display: 'inline-flex', color: '#cbd5e1' }}><HeaderIcon name="user" /></span>
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
              <HeaderIcon name="power" />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            aria-label="Iniciar sesión"
            title="Iniciar sesión"
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              borderRadius: '50%',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <HeaderIcon name="login" />
          </Link>
        )}
      </div>
    </header>
  );
};