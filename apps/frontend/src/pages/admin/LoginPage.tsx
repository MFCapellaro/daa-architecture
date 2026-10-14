import React, { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, type User } from '../../context/AuthContext';

interface AuthResponse {
  token: string;
  user: User;
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRegistration = location.pathname === '/register';
  const sessionExpired = (location.state as { sessionExpired?: boolean } | null)?.sessionExpired;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(isRegistration ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegistration ? { name, email, password } : { email, password }),
      });
      const result = await response.json() as AuthResponse & { message?: string };
      if (!response.ok) throw new Error(result.message || 'No se pudo completar la solicitud.');
      login(result.token, result.user);
      const returnTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      const destination = result.user.role === 'admin'
        ? returnTo?.startsWith('/admin/') ? returnTo : '/admin/directory'
        : '/portal';
      navigate(destination, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo completar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#ffffff',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#0f172a' }}>
          {isRegistration ? 'Registro de participante' : 'Acceso al sistema'}
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          {isRegistration
            ? 'Crea tu cuenta de participante. Podrás completar tu perfil progresivamente.'
            : 'Inicia sesión con tu cuenta del ecosistema.'}
        </p>
        {sessionExpired && (
          <p role="status" style={{ color: '#92400e', fontSize: 13 }}>
            Tu sesión expiró. Inicia sesión nuevamente para continuar.
          </p>
        )}

        <form onSubmit={(event) => void handleSubmit(event)}>
          {error && <p role="alert" style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>}
          {isRegistration && (
            <label style={{ display: 'block', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
              Nombre
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginTop: 6, borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </label>
          )}
          <label style={{ display: 'block', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
            Correo electrónico
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginTop: 6, borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '24px', fontSize: '13px', fontWeight: 600 }}>
            Contraseña
            <input
              type="password"
              required
              minLength={8}
              autoComplete={isRegistration ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginTop: 6, borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '11px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Procesando…' : isRegistration ? 'Crear cuenta de participante' : 'Iniciar sesión'}
          </button>
        </form>
        <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13 }}>
          {isRegistration ? '¿Ya tienes cuenta? ' : '¿Todavía no tienes cuenta? '}
          <Link to={isRegistration ? '/login' : '/register'}>
            {isRegistration ? 'Inicia sesión' : 'Regístrate como participante'}
          </Link>
        </p>
      </div>
    </div>
  );
};
