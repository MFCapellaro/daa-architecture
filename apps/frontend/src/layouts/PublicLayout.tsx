import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'map' | 'directory' | 'activities'>('map');

  return (
    <div className="platform">
      <header className="site-header">
        <Link className="header-brand" to="/">
          <strong>DronsAir</strong>
          <span>ECOSISTEMA DE DRONES<br />AGRÍCOLAS ARGENTINO</span>
        </Link>

        <label className="ecosystem-search">
          <span>⌕</span>
          <input placeholder="Buscar en el ecosistema (operadores, zonas, modelos...)" />
        </label>

        <nav className="header-nav">
          <button
            className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => { setActiveTab('map'); navigate('/'); }}
          >
            ⌖ <span>Mapa</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => { setActiveTab('directory'); navigate('/admin/directorio'); }}
          >
            ▱ <span>Directorio</span>
          </button>
          <button className="nav-item locked" disabled>
            ⌘ <span>Pools</span>
          </button>
        </nav>

        <div className="header-account">
          {isAuthenticated ? (
            <>
              <span className="role-badge">{user?.role || 'Usuario'}</span>
              <span id="account-label">{user?.email}</span>
              <button id="logout" onClick={logout}>Salir</button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'var(--lime, #c9e86b)',
                color: 'var(--ink, #14201c)',
                fontWeight: 600,
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Ingresar
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {children}
      </main>
    </div>
  );
};