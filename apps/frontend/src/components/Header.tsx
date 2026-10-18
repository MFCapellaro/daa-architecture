import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoUrl from '../../../logo/LogoWeb.png';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

        {/* Portal Participante / Dealer */}
        {isAuthenticated && (user?.role === 'participante' || user?.role === 'dealer') && (
          <Link to="/portal" style={{ color: isActive('/portal') ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Mi Perfil
          </Link>
        )}

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
          </div>
        )}
      </nav>

      {/* Estado del Usuario / Botón Salir */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              {user?.profile?.avatar && (
                <img
                  src={user.profile.avatar}
                  alt=""
                  aria-hidden="true"
                  style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user?.name}</div>
            </div>
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