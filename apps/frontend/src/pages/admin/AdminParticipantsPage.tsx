import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
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
  border: '1px solid #34434c',
  borderRadius: 4,
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
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | ParticipantRole>('all');
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
      setSelected((current) => current
        ? data.find((participant) => participant.id === current.id) ?? data[0] ?? null
        : data[0] ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los participantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadParticipants();
  }, []);

  const filteredParticipants = useMemo(() => {
    const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return participants.filter((participant) => {
      if (roleFilter !== 'all' && participant.role !== roleFilter) return false;
      const searchable = `${participant.name} ${participant.email}`.toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [participants, roleFilter, search]);

  useEffect(() => {
    if (filteredParticipants.length && !filteredParticipants.some((participant) => participant.id === selected?.id)) {
      setSelected(filteredParticipants[0]);
      setEditing(false);
      setGeoMessage(null);
    } else if (!filteredParticipants.length && selected) {
      setSelected(null);
      setEditing(false);
    }
  }, [filteredParticipants, selected]);

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
      setEditing(false);
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
      setEditing(false);
      await loadParticipants();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la cuenta.');
    }
  };

  return (
    <main className="admin-participants">
      <header className="participants-header">
        <div>
          <h1>Participantes y Dealers</h1>
          <p>
          Cuentas creadas mediante el registro del ecosistema.
          </p>
        </div>
        <span>{filteredParticipants.length} de {participants.length} cuentas</span>
      </header>

      {error && <p role="alert" className="participants-error">{error}</p>}

      <div className="participants-layout">
        <section className="participants-list">
          <div className="participants-toolbar">
            <label className="participants-search">
              <span className="visually-hidden">Buscar por nombre o correo</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o correo"
              />
            </label>
            <label className="participants-role-filter">
              <span className="visually-hidden">Filtrar por rol</span>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | ParticipantRole)}>
                <option value="all">Todos los roles</option>
                <option value="participante">Participante</option>
                <option value="dealer">Dealer</option>
              </select>
            </label>
          </div>
          {loading ? <p className="participants-empty">Cargando participantes…</p> : (
            <div className="participants-table-container">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id} className={`participant-row${selected?.id === participant.id ? ' participant-row--selected' : ''}`}>
                    <td>
                      <button className="participant-name" type="button" onClick={() => {
                        setSelected(participant);
                        setEditing(false);
                        setGeoMessage(null);
                      }}>
                        <strong>{participant.name}</strong>
                        <small>{participant.profile.organization || ''}</small>
                      </button>
                    </td>
                    <td className="participant-email">{participant.email}</td>
                    <td><span className="participant-role">{participant.role === 'dealer' ? 'Dealer' : 'Participante'}</span></td>
                    <td>
                      <span className={`participant-status${participant.status === 'active' ? ' participant-status--active' : ' participant-status--suspended'}`}>
                        {participant.status === 'active' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="participant-actions">
                      <ActionButton icon="edit" label={`Editar ${participant.name}`} onClick={() => {
                        setSelected({ ...participant, profile: { ...participant.profile } });
                        setEditing(true);
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
                {!filteredParticipants.length && !loading && (
                  <tr><td className="participants-empty" colSpan={5}>
                    {participants.length ? 'No hay participantes que coincidan con la búsqueda.' : 'Todavía no hay cuentas registradas.'}
                  </td></tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </section>

        {selected && (
          <section className="participant-editor">
            <header className="participant-detail-header">
              <div>
                <h2>{editing ? 'Editar participante' : selected.name}</h2>
                {!editing && <p>{selected.email}</p>}
              </div>
              {!editing && (
                <ActionButton icon="edit" label={`Editar ${selected.name}`} onClick={() => {
                  setSelected({ ...selected, profile: { ...selected.profile } });
                  setEditing(true);
                  setGeoMessage(null);
                }} />
              )}
            </header>
            {editing ? <form onSubmit={(event) => void saveParticipant(event)} className="participant-edit-form">
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
            <div className="participant-form-actions">
              <button className="participant-button participant-button--primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
              <button className="participant-button participant-button--secondary" type="button" onClick={() => {
                setSelected(participants.find((participant) => participant.id === selected.id) ?? selected);
                setEditing(false);
                setGeoMessage(null);
              }}>Cancelar</button>
            </div>
            </form> : (
              <div className="participant-summary">
                <div><strong>Rol:</strong> {selected.role === 'dealer' ? 'Dealer' : 'Participante'}</div>
                <div><strong>Acceso:</strong> {selected.status === 'active' ? 'Activo' : 'Suspendido'}</div>
                <div><strong>Organización:</strong> {selected.profile.organization || '—'}</div>
                <div><strong>Teléfono:</strong> {selected.profile.phone || '—'}</div>
                <div><strong>Ubicación:</strong> {[selected.profile.address, selected.profile.city, selected.profile.province, selected.profile.country].filter(Boolean).join(', ') || '—'}</div>
                <div><strong>Web:</strong> {selected.profile.website || '—'}</div>
                <div><strong>Acerca de:</strong> {selected.profile.bio || '—'}</div>
                <div><strong>Capacidades:</strong> {selected.profile.capabilities || '—'}</div>
                <div><strong>Intereses:</strong> {selected.profile.interests || '—'}</div>
                <div><strong>Alta:</strong> {new Date(selected.joinedAt).toLocaleDateString()}</div>
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
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};
