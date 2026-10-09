import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Determinamos el rol según el término presente en el email
    let role: UserRole = 'participante';
    let name = 'Usuario Participante';

    if (email.toLowerCase().includes('admin')) {
      role = 'admin';
      name = 'Administrador General';
    } else if (email.toLowerCase().includes('dealer')) {
      role = 'dealer';
      name = 'Dealer Comercial';
    }

    const mockUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
    };

    const mockToken = `mock_jwt_token_${Date.now()}`;

    // Guardar usuario y token en AuthContext
    login(mockToken, mockUser);
    setLoading(false);

    // Redirección según rol
    if (role === 'admin') {
      navigate('/admin/directory', { replace: true });
    } else {
      navigate('/portal', { replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#ffffff',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#0f172a' }}>
          Acceso al Sistema
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          Prueba con <strong>admin@...</strong>, <strong>dealer@...</strong> o cualquier otro correo.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dronsair.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};