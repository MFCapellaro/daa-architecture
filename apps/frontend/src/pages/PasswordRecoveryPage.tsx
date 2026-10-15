import React, { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export const PasswordRecoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const isReset = Boolean(token);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (isReset && password !== passwordConfirmation) {
        throw new Error('Las contraseñas no coinciden.');
      }

      const response = await fetch(
        isReset ? '/api/auth/password-reset/confirm' : '/api/auth/password-reset/request',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isReset ? { token, password } : { email }),
        },
      );
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || 'No se pudo completar la solicitud.');
      }
      setMessage(result.message || 'Solicitud completada.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo completar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <section style={{
        width: '100%',
        maxWidth: '400px',
        alignSelf: 'flex-start',
        background: '#ffffff',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 8px', color: '#0f172a' }}>
          {isReset ? 'Crear nueva contraseña' : 'Recuperar contraseña'}
        </h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          {isReset
            ? 'Elige una contraseña nueva para tu cuenta de participante.'
            : 'Te enviaremos un enlace de recuperación si el correo corresponde a una cuenta de participante.'}
        </p>

        {error && <p role="alert" style={{ color: '#b91c1c', fontSize: '13px' }}>{error}</p>}
        {message ? (
          <div role="status">
            <p style={{ color: '#166534', fontSize: '14px', lineHeight: 1.5 }}>{message}</p>
            {!isReset && (
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
                La recuperación de la cuenta administradora se realiza cambiando `ADMIN_PASSWORD` en Hostinger.
              </p>
            )}
            <Link to="/login">Volver al inicio de sesión</Link>
          </div>
        ) : (
          <form onSubmit={(event) => void handleSubmit(event)}>
            {!isReset ? (
              <label style={{ display: 'block', marginBottom: '20px', fontSize: '13px', fontWeight: 600 }}>
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
            ) : (
              <>
                <label style={{ display: 'block', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                  Nueva contraseña
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginTop: 6, borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </label>
                <label style={{ display: 'block', marginBottom: '20px', fontSize: '13px', fontWeight: 600 }}>
                  Repetir contraseña
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginTop: 6, borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </label>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '11px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              {loading ? 'Procesando…' : isReset ? 'Guardar contraseña' : 'Enviar enlace'}
            </button>
          </form>
        )}

        {!message && (
          <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: '13px' }}>
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        )}
      </section>
    </div>
  );
};
