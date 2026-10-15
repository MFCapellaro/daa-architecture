import React, { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loadGoogleMaps } from '../../lib/googleMaps';
import './AdminParticipantsPage.css';

type ParticipantRole = 'participante' | 'dealer';
type ParticipantStatus = 'active' | 'suspended';

interface ParticipantProfile {
  organization?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  website?: string;
  bio?: string;
  capabilities?: string;
  interests?: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt: string;
  profile: ParticipantProfile;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  font: 'inherit',
};

const tokenHeaders = (token: string | null): HeadersInit => {
  if (!token) throw new Error('La sesión administrativa expiró. Inicia sesión nuevamente.');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

type ActionIcon = 'edit' | 'suspend' | 'resume' | 'delete';

const actionPaths: Record<ActionIcon, React.ReactNode> = {
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  suspend: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9v6m6-6v6" /></>,
  resume: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4z" /></>,
  delete: <><path d="M3 6h18" /><path d="M8 6V4h8v2m3 0-1 14H6L5 6" /><path d="M10 11v5m4-5v5" /></>,
};

const ActionButton: React.FC<{
  icon: ActionIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, onClick, danger = false }) => (
  <button
    type="button"
    className={`participant-action${danger ? ' participant-action--danger' : ''}`}
    aria-label={label}
    title={label}
    onClick={onClick}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {actionPaths[icon]}
    </svg>
  </button>
);

const resolveAddress = async (profile: ParticipantProfile): Promise<{ latitude: string; longitude: string }> => {
  const { geocoding } = await loadGoogleMaps();
  const address = [profile.address, profile.city, profile.province, profile.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
  if (!address) throw new Error('Completa la dirección antes de buscar las coordenadas.');

  return new Promise((resolve, reject) => {
    new geocoding.Geocoder().geocode({ address }, (results, status) => {
      const location = results?.[0]?.geometry.location;
      if (status !== 'OK' || !location) {
        reject(new Error(`No se pudieron obtener coordenadas para la dirección (${status}).`));
        return;
      }
      resolve({ latitude: location.lat().toFixed(6), longitude: location.lng().toFixed(6) });
    });
  });
};

export const AdminParticipantsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selected, setSelected] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectExpiredSession = () => {
    logout();
    navigate('/admin/login', {
      replace: true,
      state: { from: { pathname: location.pathname }, sessionExpired: true },
    });
  };

  const loadParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/participants', { headers: tokenHeaders(token) });
      if (response.status === 401) {
        redirectExpiredSession();
        return;
      }
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        throw new Error(result.message || `No se pudieron cargar los participantes (${response.status}).`);
      }
      const data = await response.json() as Participant[];
      setParticipants(data);
      setSelected((current) => current ? data.find((participant) => participant.id === current.id) ?? null : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los participantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadParticipants();
  }, []);

  const updateSelected = (updates: Partial<Participant>) => {
    setSelected((current) => current ? { ...current, ...updates } : current);
  };

  const updateAddressField = (key: 'address' | 'city' | 'province' | 'country', value: string) => {
    setSelected((current) => {
      if (!current) return current;
      const addressChanged = current.profile[key] !== value;
      return {
        ...current,
        profile: {
          ...current.profile,
          [key]: value,
          ...(addressChanged ? { latitude: '', longitude: '' } : {}),
        },
      };
    });
    setGeoMessage(null);
  };

  const geocodeSelectedAddress = async (): Promise<ParticipantProfile | null> => {
    if (!selected) return null;
    setGeocoding(true);
    setGeoMessage(null);
    try {
      const coordinates = await resolveAddress(selected.profile);
      const profile = { ...selected.profile, ...coordinates };
      updateSelected({ profile });
      setGeoMessage('Coordenadas obtenidas correctamente.');
      return profile;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo geocodificar la dirección.';
      setGeoMessage(message);
      return null;
    } finally {
      setGeocoding(false);
    }
  };

  const saveParticipant = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      let profile = selected.profile;
      if (profile.address?.trim() && (!profile.latitude || !profile.longitude)) {
        profile = (await geocodeSelectedAddress()) ?? profile;
      }
      const response = await fetch(`/api/admin/participants/${encodeURIComponent(selected.id)}`, {
        method: 'PATCH',
        headers: tokenHeaders(token),
        body: JSON.stringify({
          name: selected.name.trim(),
          email: selected.email.trim(),
          role: selected.role,
          profile,
        }),
      });
      if (response.status === 401) {
        redirectExpiredSession();
        return;
      }
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        throw new Error(result.message || `No se pudo guardar (${response.status}).`);
      }
      await loadParticipants();
      if (profile.address?.trim() && (!profile.latitude || !profile.longitude)) {
        setGeoMessage('Participante guardado, pero no se obtuvieron coordenadas. Revisa la dirección o la configuración de Google Maps.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el participante.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSuspension = async (participant: Participant) => {
    const status: ParticipantStatus = participant.status === 'suspended' ? 'active' : 'suspended';
    setError(null);
    try {
      const response = await fetch(`/api/admin/participants/${encodeURIComponent(participant.id)}`, {
        method: 'PATCH',
        headers: tokenHeaders(token),
        body: JSON.stringify({ status }),
      });
      if (response.status === 401) {
        redirectExpiredSession();
        return;
      }
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        throw new Error(result.message || `No se pudo actualizar el acceso (${response.status}).`);
      }
      await loadParticipants();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el acceso.');
    }
  };

  const deleteParticipant = async (participant: Participant) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${participant.name}? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/participants/${encodeURIComponent(participant.id)}`, {
        method: 'DELETE',
        headers: tokenHeaders(token),
      });
      if (response.status === 401) {
        redirectExpiredSession();
        return;
      }
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        throw new Error(result.message || `No se pudo eliminar (${response.status}).`);
      }
      setSelected((current) => current?.id === participant.id ? null : current);
      await loadParticipants();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la cuenta.');
    }
  };

  return (
    <main className="admin-participants" style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Participantes y Dealers</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
          Cuentas creadas mediante el registro del ecosistema.
        </p>
      </header>

      {error && <p role="alert" style={{ padding: 12, borderRadius: 6, color: '#991b1b', background: '#fee2e2' }}>{error}</p>}

      <div className={`participants-layout${selected ? ' participants-layout--editing' : ''}`}>
        <section style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
          {loading ? <p style={{ padding: 16 }}>Cargando participantes…</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Nombre</th>
                  <th style={{ padding: '12px 16px' }}>Correo</th>
                  <th style={{ padding: '12px 16px' }}>Rol</th>
                  <th style={{ padding: '12px 16px' }}>Acceso</th>
                  <th style={{ padding: '12px 16px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id} style={{ borderTop: '1px solid #e2e8f0', background: selected?.id === participant.id ? '#eff6ff' : '#fff' }}>
                    <td style={{ padding: '12px 16px' }}>{participant.name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{participant.email}</td>
                    <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{participant.role}</td>
                    <td style={{ padding: '12px 16px', color: participant.status === 'active' ? '#15803d' : '#b91c1c' }}>
                      {participant.status === 'active' ? 'Activo' : 'Suspendido'}
                    </td>
                    <td className="participant-actions">
                      <ActionButton icon="edit" label={`Editar ${participant.name}`} onClick={() => {
                        setSelected({ ...participant, profile: { ...participant.profile } });
                        setGeoMessage(null);
                      }} />
                      <ActionButton
                        icon={participant.status === 'suspended' ? 'resume' : 'suspend'}
                        label={participant.status === 'suspended' ? `Reactivar ${participant.name}` : `Suspender ${participant.name}`}
                        onClick={() => void toggleSuspension(participant)}
                      />
                      <ActionButton icon="delete" label={`Eliminar ${participant.name}`} onClick={() => void deleteParticipant(participant)} danger />
                    </td>
                  </tr>
                ))}
                {!participants.length && !loading && (
                  <tr><td colSpan={5} style={{ padding: 20, color: '#64748b' }}>Todavía no hay cuentas registradas.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        {selected && (
          <form onSubmit={(event) => void saveParticipant(event)} className="participant-editor">
            <h2 style={{ margin: 0, fontSize: 18 }}>Editar participante</h2>
            <label>Nombre<input required value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} style={fieldStyle} /></label>
            <label>Email<input type="email" required value={selected.email} onChange={(event) => updateSelected({ email: event.target.value })} style={fieldStyle} /></label>
            <label>Rol
              <select value={selected.role} onChange={(event) => updateSelected({ role: event.target.value as ParticipantRole })} style={fieldStyle}>
                <option value="participante">Participante</option>
                <option value="dealer">Dealer</option>
              </select>
            </label>
            <h3 style={{ margin: '8px 0 0', fontSize: 15 }}>Perfil progresivo</h3>
            {([
              ['organization', 'Organización'],
              ['phone', 'Teléfono'],
              ['address', 'Dirección'],
              ['city', 'Ciudad'],
              ['province', 'Provincia'],
              ['country', 'País'],
              ['website', 'Sitio web'],
              ['bio', 'Acerca de'],
              ['capabilities', 'Capacidades'],
              ['interests', 'Intereses'],
            ] as const).map(([key, label]) => (
              <label key={key}>{label}
                <input
                  value={selected.profile?.[key] ?? ''}
                  onChange={(event) => key === 'address' || key === 'city' || key === 'province' || key === 'country'
                    ? updateAddressField(key, event.target.value)
                    : updateSelected({ profile: { ...selected.profile, [key]: event.target.value } })}
                  style={fieldStyle}
                />
              </label>
            ))}
            <button type="button" onClick={() => void geocodeSelectedAddress()} disabled={geocoding || !selected.profile.address?.trim()}>
              {geocoding ? 'Buscando ubicación…' : 'Geocodificar dirección'}
            </button>
            {geoMessage && <p className="participant-geo-message" role="status">{geoMessage}</p>}
            {selected.profile.latitude && selected.profile.longitude && (
              <section className="participant-map" aria-label="Ubicación del participante">
                <p>Coordenadas: {selected.profile.latitude}, {selected.profile.longitude}</p>
                <iframe
                  title={`Mapa de ubicación de ${selected.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${selected.profile.latitude},${selected.profile.longitude}`)}&z=14&output=embed`}
                />
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.profile.latitude},${selected.profile.longitude}`)}`} target="_blank" rel="noreferrer">
                  Abrir en Google Maps
                </a>
              </section>
            )}
            <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
            <button type="button" onClick={() => setSelected(null)}>Cancelar</button>
          </form>
        )}
      </div>
    </main>
  );
};
