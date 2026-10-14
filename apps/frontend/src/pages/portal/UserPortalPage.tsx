import React, { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, type User } from '../../context/AuthContext';

interface ParticipantProfile {
  organization?: string;
  phone?: string;
  city?: string;
  province?: string;
  country?: string;
  website?: string;
  bio?: string;
  capabilities?: string;
  interests?: string;
}

interface ParticipantMe {
  id: string;
  name: string;
  email: string;
  role: 'participante' | 'dealer';
  profile: ParticipantProfile;
  dealerAgreementAccepted?: boolean;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 5,
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  font: 'inherit',
};

const getToken = (): string => {
  const token = localStorage.getItem('daa_token');
  if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
  return token;
};

export const UserPortalPage: React.FC = () => {
  const { user, login, updateUser } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<ParticipantMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isPoolPage = location.pathname === '/portal/pools';
  const isAgreementPage = location.pathname === '/portal/acuerdos';

  const loadProfile = async () => {
    const response = await fetch('/api/participants/me', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await response.json() as ParticipantMe & { message?: string };
    if (!response.ok) throw new Error(result.message || `No se pudo cargar el perfil (${response.status}).`);
    setProfile(result);
  };

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        setError(null);
        const response = await fetch('/api/participants/me', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const result = await response.json() as ParticipantMe & { message?: string };
        if (!response.ok) throw new Error(result.message || `No se pudo cargar el perfil (${response.status}).`);
        if (active) setProfile(result);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el perfil.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void initialize();
    return () => { active = false; };
  }, []);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/participants/me', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, profile: profile.profile }),
      });
      const result = await response.json() as { user?: User; message?: string };
      if (!response.ok) throw new Error(result.message || `No se pudo guardar el perfil (${response.status}).`);
      if (result.user) updateUser(result.user);
      await loadProfile();
      setNotice('Perfil guardado.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const requestDealerAccess = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/participants/me/dealer', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await response.json() as { token?: string; user?: User; message?: string };
      if (!response.ok) throw new Error(result.message || `No se pudo solicitar el rol Dealer (${response.status}).`);
      if (result.token && result.user) login(result.token, result.user);
      await loadProfile();
      setNotice('Tu cuenta ya tiene el perfil Dealer. La publicación queda pendiente del acuerdo aprobado.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo solicitar el rol Dealer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: 32 }}>Cargando perfil…</p>;

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <section style={{ padding: 24, borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
        <h1 style={{ margin: '0 0 8px', color: '#0f172a' }}>Portal de {user?.role === 'dealer' ? 'Dealer' : 'Participante'}</h1>
        <p style={{ margin: '0 0 16px', color: '#64748b' }}>
          Completa y amplía tu perfil a medida que participas en la plataforma.
        </p>

        {error && <p role="alert" style={{ padding: 10, color: '#991b1b', background: '#fee2e2', borderRadius: 6 }}>{error}</p>}
        {notice && <p role="status" style={{ padding: 10, color: '#166534', background: '#dcfce7', borderRadius: 6 }}>{notice}</p>}

        {user?.role === 'dealer' && (
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '16px 0', paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
            <Link to="/portal">Mi perfil</Link>
            <Link to="/portal/pools">Publicación de pools</Link>
            <Link to="/portal/acuerdos">Acuerdos Dealer</Link>
          </nav>
        )}

        {isAgreementPage ? (
          <section aria-labelledby="dealer-agreement-title">
            <h2 id="dealer-agreement-title">Acuerdos para Dealers</h2>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>
              El texto aprobado del acuerdo previo al uso y publicación todavía no está configurado.
              Por este motivo no se puede aceptar el acuerdo ni habilitar la publicación de pools.
            </p>
            <p role="status" style={{ padding: 12, borderRadius: 6, background: '#fff7ed', color: '#9a3412' }}>
              Publicación bloqueada hasta integrar el texto aprobado.
            </p>
            <Link to="/portal/pools">Ir a publicación de pools</Link>
          </section>
        ) : isPoolPage ? (
          <section aria-labelledby="pool-publication-title">
            <h2 id="pool-publication-title">Publicación de pools</h2>
            {user?.role !== 'dealer' ? (
              <>
                <p>La publicación de pools está disponible para cuentas Dealer.</p>
                <button type="button" disabled={saving} onClick={() => void requestDealerAccess()}>
                  {saving ? 'Procesando…' : 'Extender mi cuenta a Dealer'}
                </button>
              </>
            ) : (
              <>
                <p style={{ color: '#475569' }}>Antes de usar la plataforma o publicar pools, debes revisar el acuerdo Dealer.</p>
                <p role="status" style={{ padding: 12, borderRadius: 6, background: '#fff7ed', color: '#9a3412' }}>
                  Publicación deshabilitada: falta integrar el texto aprobado del acuerdo.
                </p>
                <Link to="/portal/acuerdos">Consultar estado del acuerdo</Link>
                <fieldset disabled style={{ marginTop: 18, padding: 16, border: '1px solid #cbd5e1', borderRadius: 8 }}>
                  <legend>Nuevo pool (bloqueado)</legend>
                  <label>Nombre<input disabled placeholder="Disponible después de aprobar el acuerdo" style={fieldStyle} /></label>
                  <label>Descripción<textarea disabled rows={3} style={fieldStyle} /></label>
                  <button type="button" disabled>Publicar pool</button>
                </fieldset>
              </>
            )}
          </section>
        ) : (
          <>
            {profile && (
              <form onSubmit={(event) => void saveProfile(event)} style={{ display: 'grid', gap: 14, maxWidth: 680 }}>
                <h2 style={{ margin: '4px 0' }}>Mi perfil</h2>
                <label>Nombre<input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} style={fieldStyle} /></label>
                <label>Email<input readOnly value={profile.email} style={{ ...fieldStyle, background: '#f8fafc' }} /></label>
                {([
                  ['organization', 'Organización'],
                  ['phone', 'Teléfono'],
                  ['city', 'Ciudad'],
                  ['province', 'Provincia'],
                  ['country', 'País'],
                  ['website', 'Sitio web'],
                  ['capabilities', 'Capacidades'],
                  ['interests', 'Intereses'],
                ] as const).map(([key, label]) => (
                  <label key={key}>{label}
                    <input
                      value={profile.profile?.[key] ?? ''}
                      onChange={(event) => setProfile({
                        ...profile,
                        profile: { ...profile.profile, [key]: event.target.value },
                      })}
                      style={fieldStyle}
                    />
                  </label>
                ))}
                <label>Acerca de mí<textarea rows={4} value={profile.profile?.bio ?? ''} onChange={(event) => setProfile({
                  ...profile,
                  profile: { ...profile.profile, bio: event.target.value },
                })} style={fieldStyle} /></label>
                <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar perfil'}</button>
              </form>
            )}

            {user?.role === 'participante' && (
              <section style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: 18 }}>¿Eres Dealer?</h2>
                <p style={{ color: '#64748b' }}>Puedes extender tu perfil para solicitar acceso a la publicación de pools.</p>
                <button type="button" disabled={saving} onClick={() => void requestDealerAccess()}>
                  {saving ? 'Procesando…' : 'Extender mi perfil a Dealer'}
                </button>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
};
