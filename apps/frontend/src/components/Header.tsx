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
      <div className="brand" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <Link
          to="/directory"
          aria-label="DronsAir Ecosistema"
          style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}
        >
          <img
            src={logoUrl}
            alt="DronsAir"
            style={{
              display: 'block',
              height: '46px',
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
        </Link>
      </div>

      {/* Navegación por Perfil */}
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {/* Vista Pública */}
        <Link to="/directory" style={{ color: isActive('/directory') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          📁 Directorio
        </Link>
        <Link to="/map" style={{ color: isActive('/map') || isActive('/mapa') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
          🗺️ Mapa Satelital
        </Link>

        {/* Portal Participante / Dealer */}
        {isAuthenticated && (user?.role === 'participante' || user?.role === 'dealer') && (
          <Link to="/portal" style={{ color: isActive('/portal') ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            👤 Mi Portal ({user.role})
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
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Cerrar Sesión
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