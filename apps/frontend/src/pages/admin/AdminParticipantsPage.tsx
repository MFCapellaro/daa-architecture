import React, { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type ParticipantRole = 'participante' | 'dealer';
type ParticipantStatus = 'active' | 'suspended';

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

export const AdminParticipantsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selected, setSelected] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const saveParticipant = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/participants/${encodeURIComponent(selected.id)}`, {
        method: 'PATCH',
        headers: tokenHeaders(token),
        body: JSON.stringify({
          name: selected.name.trim(),
          email: selected.email.trim(),
          role: selected.role,
          profile: selected.profile,
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
    <main style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Participantes y Dealers</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
          Cuentas creadas mediante el registro del ecosistema.
        </p>
      </header>

      {error && <p role="alert" style={{ padding: 12, borderRadius: 6, color: '#991b1b', background: '#fee2e2' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: 20, alignItems: 'start' }}>
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
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      <button type="button" onClick={() => setSelected({ ...participant, profile: { ...participant.profile } })}>Editar</button>{' '}
                      <button type="button" onClick={() => void toggleSuspension(participant)}>
                        {participant.status === 'suspended' ? 'Reactivar' : 'Suspender'}
                      </button>{' '}
                      <button type="button" onClick={() => void deleteParticipant(participant)} style={{ color: '#b91c1c' }}>Eliminar</button>
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
          <form onSubmit={(event) => void saveParticipant(event)} style={{ display: 'grid', gap: 12, padding: 18, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
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
                  onChange={(event) => updateSelected({ profile: { ...selected.profile, [key]: event.target.value } })}
                  style={fieldStyle}
                />
              </label>
            ))}
            <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
            <button type="button" onClick={() => setSelected(null)}>Cancelar</button>
          </form>
        )}
      </div>
    </main>
  );
};
