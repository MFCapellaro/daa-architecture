import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, type User } from '../../context/AuthContext';
import './UserPortalPage.css';

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
  avatar?: string;
}

interface ParticipantMe {
  id: string;
  name: string;
  email: string;
  role: 'participante' | 'dealer';
  profile: ParticipantProfile;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 5,
  padding: '9px 10px',
  border: '1px solid #343840',
  borderRadius: 6,
  font: 'inherit',
};

const getToken = (): string => {
  const token = localStorage.getItem('daa_token');
  if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
  return token;
};

const makeAvatarDataUrl = async (file: File): Promise<string> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Selecciona una imagen JPG, PNG o WebP.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('La imagen debe pesar menos de 10 MB.');
  }

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
      image.src = imageUrl;
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }

  const scale = Math.min(1, 480 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo procesar la imagen.');

  let quality = 0.82;
  const render = () => {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  };
  let avatar = render();
  while (avatar.length > 70_000) {
    if (quality > 0.52) {
      quality = Math.max(0.5, quality - 0.1);
    } else {
      const nextSize = Math.round(Math.max(canvas.width, canvas.height) * 0.8);
      if (nextSize < 96) {
        throw new Error('No se pudo reducir la imagen lo suficiente. Prueba con otra foto.');
      }
      const resize = nextSize / Math.max(canvas.width, canvas.height);
      canvas.width = Math.max(1, Math.round(canvas.width * resize));
      canvas.height = Math.max(1, Math.round(canvas.height * resize));
      quality = 0.82;
    }
    avatar = render();
  }
  return avatar;
};

export const UserPortalPage: React.FC = () => {
  const { user, login, updateUser } = useAuth();
  const [profile, setProfile] = useState<ParticipantMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProfile = async () => {
    const response = await fetch('/api/participants/me', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await response.json() as ParticipantMe & { message?: string };
    if (!response.ok) throw new Error(result.message || `No se pudo cargar el perfil (${response.status}).`);
    setProfile(result);
    updateUser({
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      profile: { avatar: result.profile?.avatar },
    });
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
        if (active) {
          setProfile(result);
          updateUser({
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role,
            profile: { avatar: result.profile?.avatar },
          });
        }
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

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file || !profile) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const avatar = await makeAvatarDataUrl(file);
      const response = await fetch('/api/participants/me', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { avatar } }),
      });
      const result = await response.json() as { user?: User; message?: string };
      if (!response.ok) throw new Error(result.message || `No se pudo guardar la foto (${response.status}).`);
      if (result.user) updateUser(result.user);
      setProfile((current) => current
        ? { ...current, profile: { ...current.profile, avatar } }
        : current);
      setNotice('Foto de perfil actualizada.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la foto.');
    } finally {
      setSaving(false);
    }
  };

  const removeAvatar = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/participants/me', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { avatar: '' } }),
      });
      const result = await response.json() as { user?: User; message?: string };
      if (!response.ok) throw new Error(result.message || `No se pudo eliminar la foto (${response.status}).`);
      if (result.user) updateUser(result.user);
      setProfile((current) => current
        ? { ...current, profile: { ...current.profile, avatar: '' } }
        : current);
      setNotice('Foto de perfil eliminada.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la foto.');
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
      setNotice('Tu cuenta ya tiene el perfil Dealer. Acepta el acuerdo vigente para habilitar la publicación de Pools.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo solicitar el rol Dealer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="user-portal"><p className="user-portal__copy">Cargando perfil…</p></main>;

  return (
    <main className="user-portal">
      <section className="user-portal__card">
        <h1 className="user-portal__title">Mi Perfil</h1>
        <p className="user-portal__intro">
          Completa y amplía tu perfil a medida que participas en la plataforma.
        </p>

        {error && <p role="alert" className="user-portal__message user-portal__message--error">{error}</p>}
        {notice && <p role="status" className="user-portal__message user-portal__message--success">{notice}</p>}

        {user?.role === 'dealer' && (
          <nav className="user-portal__nav">
            <Link to="/portal">Mi Perfil</Link>
            <Link to="/portal/pools">Mis Pools</Link>
            <Link to="/portal/acuerdos">Acuerdos Dealer</Link>
          </nav>
        )}
        {(user?.role === 'participante' || user?.role === 'dealer') && (
          <nav className="user-portal__nav" aria-label="Actividades">
            <Link to="/portal/actividades">Publicar una actividad</Link>
          </nav>
        )}

        <>
          {profile && (
              <form onSubmit={(event) => void saveProfile(event)} className="user-portal__form">
                <div className="user-portal__photo">
                  {profile.profile?.avatar
                    ? <img className="user-portal__avatar" src={profile.profile.avatar} alt={`Foto de ${profile.name}`} />
                    : <div className="user-portal__avatar user-portal__avatar--empty" aria-label="Sin foto de perfil">
                        {profile.name.trim().charAt(0).toUpperCase()}
                      </div>}
                  <div className="user-portal__photo-actions">
                    <label className="user-portal__upload">
                      {saving ? 'Guardando…' : 'Cambiar foto'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => void uploadAvatar(event)}
                        disabled={saving}
                        aria-label="Subir foto de perfil"
                      />
                    </label>
                    {profile.profile?.avatar && (
                      <button
                        className="user-portal__text-button"
                        type="button"
                        onClick={() => void removeAvatar()}
                        disabled={saving}
                      >
                        Eliminar foto
                      </button>
                    )}
                    <span>JPG, PNG o WebP</span>
                  </div>
                </div>
                <label>Nombre<input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} style={fieldStyle} /></label>
                <label>Email<input readOnly value={profile.email} style={{ ...fieldStyle, background: '#202329' }} /></label>
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
                <button className="user-portal__submit" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar perfil'}</button>
              </form>
            )}

          {user?.role === 'participante' && (
              <section className="user-portal__dealer">
                <h2 className="user-portal__section-title">¿Eres Dealer?</h2>
                <p className="user-portal__copy">Puedes extender tu perfil para solicitar acceso a la publicación de pools.</p>
                <button className="user-portal__submit" type="button" disabled={saving} onClick={() => void requestDealerAccess()}>
                  {saving ? 'Procesando…' : 'Extender mi perfil a Dealer'}
                </button>
              </section>
            )}
        </>
      </section>
    </main>
  );
};
