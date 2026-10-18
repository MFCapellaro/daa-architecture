import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActivityForm } from '../../components/ActivityForm';
import { EMPTY_ACTIVITY, type Activity, type ActivityInput } from '../../types/activity';
import './AdminActivitiesPage.css';

type DateGroup = 'active' | 'historical';
type VisibilityFilter = 'all' | 'visible' | 'hidden';
interface ActivityNotification {
  id: string;
  title: string;
  startsAt: string;
  createdAt: string;
}

const dateGroup = (activity: Activity, now: number): DateGroup =>
  new Date(activity.endsAt).getTime() >= now ? 'active' : 'historical';

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

const kindLabel: Record<Activity['kind'], string> = {
  training: 'Capacitación',
  course: 'Curso',
  expo: 'Expo',
  'field-application': 'Aplicación a campo',
  event: 'Evento',
  other: 'Otra actividad',
};

export const AdminActivitiesPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [editing, setEditing] = useState(false);
  const [dateTab, setDateTab] = useState<DateGroup>('active');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const notificationSignature = useRef<string | null>(null);

  const authorizedFetch = (url: string, init?: RequestInit) => {
    if (!token) throw new Error('La sesión administrativa expiró. Inicia sesión nuevamente.');
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    if (init?.body) headers.set('Content-Type', 'application/json');
    return fetch(url, {
      ...init,
      headers,
    });
  };

  const loadActivities = async (quiet = false): Promise<Activity[]> => {
    if (!quiet) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await authorizedFetch('/api/admin/activities');
      if (response.status === 401) {
        logout();
        return [];
      }
      const result = await response.json() as Activity[] | { message?: string };
      if (!response.ok) {
        const message = !Array.isArray(result) ? result.message : undefined;
        throw new Error(message || `No se pudieron cargar las actividades (${response.status}).`);
      }
      if (!Array.isArray(result)) throw new Error('La respuesta de actividades no es válida.');
      setActivities(result);
      setSelected((current) => current ? result.find((activity) => activity.id === current.id) ?? null : result[0] ?? null);
      return result;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las actividades.');
      return [];
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    void loadActivities();
    const refreshNotifications = async () => {
      try {
        const response = await authorizedFetch('/api/admin/activities/notifications');
        if (response.status === 401) {
          logout();
          return;
        }
        const result = await response.json() as ActivityNotification[] | { message?: string };
        if (!response.ok) {
          const message = !Array.isArray(result) ? result.message : undefined;
          throw new Error(message || `No se pudieron consultar las notificaciones (${response.status}).`);
        }
        if (!Array.isArray(result)) throw new Error('La respuesta de notificaciones no es válida.');
        const signature = result.map((notification) => notification.id).join('|');
        if (notificationSignature.current !== null && signature !== notificationSignature.current) {
          void loadActivities(true);
        }
        notificationSignature.current = signature;
        setNotifications(result);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudieron consultar las notificaciones.');
      }
    };
    void refreshNotifications();
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    const notificationTimer = window.setInterval(() => void refreshNotifications(), 30_000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(notificationTimer);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return activities.filter((activity) => {
      if (dateGroup(activity, now) !== dateTab) return false;
      if (visibilityFilter === 'visible' && !activity.visible) return false;
      if (visibilityFilter === 'hidden' && activity.visible) return false;
      const searchable = [
        activity.title,
        activity.location,
        activity.description,
        activity.source.name,
        activity.source.email,
        ...activity.linkedEntities,
      ].join(' ').toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [activities, dateTab, now, search, visibilityFilter]);

  const activeCount = activities.filter((activity) => dateGroup(activity, now) === 'active').length;
  const historicalCount = activities.length - activeCount;
  const pendingCount = notifications.length;

  useEffect(() => {
    if (editing && selected?.id === '') return;
    if (filteredActivities.length && !filteredActivities.some((activity) => activity.id === selected?.id)) {
      setSelected(filteredActivities[0]);
      setEditing(false);
    } else if (!filteredActivities.length && selected) {
      setSelected(null);
      setEditing(false);
    }
  }, [editing, filteredActivities, selected]);

  const saveActivity = async (input: ActivityInput) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const isNew = !selected?.id;
      const response = await authorizedFetch(
        isNew ? '/api/admin/activities' : `/api/admin/activities/${encodeURIComponent(selected.id)}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify({
            ...input,
            ...(isNew ? {} : { visible: selected.visible }),
          }),
        },
      );
      const result = await response.json() as Activity | { message?: string };
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) throw new Error('message' in result
        ? result.message || `No se pudo guardar la actividad (${response.status}).`
        : `No se pudo guardar la actividad (${response.status}).`);
      if (!('id' in result)) throw new Error('El servidor no devolvió la actividad guardada.');
      await loadActivities();
      setSelected(result);
      setEditing(false);
      setNotice(isNew
        ? 'Actividad creada oculta. Revisa el contenido y hazla visible cuando esté aprobada.'
        : 'Actividad actualizada.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la actividad.');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (activity: Activity) => {
    setError(null);
    setNotice(null);
    try {
      const response = await authorizedFetch(`/api/admin/activities/${encodeURIComponent(activity.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ visible: !activity.visible }),
      });
      const result = await response.json() as Activity | { message?: string };
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) throw new Error('message' in result
        ? result.message || `No se pudo cambiar la visibilidad (${response.status}).`
        : `No se pudo cambiar la visibilidad (${response.status}).`);
      await loadActivities();
      setNotice(activity.visible ? 'Actividad ocultada.' : 'Actividad aprobada y publicada.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cambiar la visibilidad.');
    }
  };

  const deleteActivity = async (activity: Activity) => {
    if (!window.confirm(`¿Eliminar la actividad "${activity.title}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      const response = await authorizedFetch(`/api/admin/activities/${encodeURIComponent(activity.id)}`, { method: 'DELETE' });
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        throw new Error(result.message || `No se pudo eliminar la actividad (${response.status}).`);
      }
      setSelected(null);
      setEditing(false);
      await loadActivities();
      setNotice('Actividad eliminada.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la actividad.');
    }
  };

  const beginNew = () => {
    const nowDate = new Date();
    const start = new Date(nowDate.getTime() + 60 * 60 * 1000);
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setSelected({
      ...EMPTY_ACTIVITY,
      id: '',
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      visible: false,
      reviewed: false,
      source: { id: '', name: 'BackOffice', email: '', role: 'admin' },
      createdAt: '',
      updatedAt: '',
    });
    setEditing(true);
    setNotice(null);
    setError(null);
  };

  return (
    <main className="admin-activities">
      <header className="activities-header">
        <div>
          <h1>Actividades</h1>
          <p>Revisión, aprobación y calendario del ecosistema.</p>
        </div>
        <div className="activities-header__actions">
          {pendingCount > 0 && <button
            className="activities-notification"
            type="button"
            onClick={() => {
              const latest = notifications[0];
              const activity = activities.find((item) => item.id === latest?.id);
              if (!activity) return;
              setDateTab(dateGroup(activity, now));
              setVisibilityFilter('all');
              setSearch('');
              setSelected(activity);
              setEditing(false);
            }}
          >
            <span aria-hidden="true">●</span> {pendingCount} nueva{pendingCount === 1 ? '' : 's'} para revisar
          </button>}
          <button className="activities-button activities-button--primary" type="button" onClick={beginNew}>
            + Nueva actividad
          </button>
        </div>
      </header>

      {error && <p className="activities-message activities-message--error" role="alert">{error}</p>}
      {notice && <p className="activities-message activities-message--notice" role="status">{notice}</p>}

      <nav className="activities-tabs" aria-label="Periodo de actividades">
        <button type="button" className={dateTab === 'active' ? 'is-active' : ''} onClick={() => setDateTab('active')}>
          Activas <span>{activeCount}</span>
        </button>
        <button type="button" className={dateTab === 'historical' ? 'is-active' : ''} onClick={() => setDateTab('historical')}>
          Históricas <span>{historicalCount}</span>
        </button>
      </nav>

      <div className="activities-layout">
        <section className="activities-list">
          <div className="activities-toolbar">
            <label className="activities-search">
              <span className="visually-hidden">Buscar actividades</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
              </svg>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por evento, lugar o entidad" />
            </label>
            <label>
              <span className="visually-hidden">Filtrar visibilidad</span>
              <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}>
                <option value="all">Visibles y ocultas</option>
                <option value="visible">Visibles</option>
                <option value="hidden">Ocultas</option>
              </select>
            </label>
          </div>
          {loading ? <p className="activities-empty">Cargando actividades…</p> : (
            <div className="activities-table-wrap">
              <table className="activities-table">
                <thead><tr><th>Actividad</th><th>Fecha</th><th>Origen</th><th>Publicación</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id} className={selected?.id === activity.id ? 'is-selected' : ''}>
                      <td>
                        <button className="activities-name" type="button" onClick={() => {
                          setSelected(activity);
                          setEditing(false);
                        }}>
                          <strong>{activity.title}</strong>
                          <small>{kindLabel[activity.kind]} · {activity.locationKind === 'virtual' ? 'Virtual' : activity.location}</small>
                        </button>
                      </td>
                      <td>{formatDate(activity.startsAt)}</td>
                      <td><span className="activities-source">{activity.source.role}</span><small className="activities-source__name">{activity.source.name}</small></td>
                      <td>
                        <span className={`activities-visibility${activity.visible ? ' is-visible' : ' is-hidden'}`}>
                          {activity.visible ? 'Visible' : activity.reviewed ? 'Oculta' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        <div className="activities-row-actions">
                          <button type="button" aria-label={`Editar ${activity.title}`} title="Editar" onClick={() => {
                            setSelected(activity);
                            setEditing(true);
                          }}>
                            <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
                          </button>
                          <button type="button" aria-label={`${activity.visible ? 'Ocultar' : 'Aprobar y publicar'} ${activity.title}`} title={activity.visible ? 'Ocultar' : 'Aprobar y publicar'} onClick={() => void toggleVisibility(activity)}>
                            {activity.visible ? '◉' : '○'}
                          </button>
                          <button className="is-danger" type="button" aria-label={`Eliminar ${activity.title}`} title="Eliminar" onClick={() => void deleteActivity(activity)}>×</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredActivities.length && !loading && (
                    <tr><td colSpan={5} className="activities-empty">
                      {activities.length ? 'No hay actividades que coincidan con los filtros.' : 'Todavía no hay actividades registradas.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selected && (
          <aside className="activity-detail">
            <header className="activity-detail__header">
              <div>
                <h2>{editing ? (selected.id ? 'Editar actividad' : 'Nueva actividad') : selected.title}</h2>
                {!editing && <p>{formatDate(selected.startsAt)}</p>}
              </div>
              {!editing && <button className="activities-button activities-button--secondary" type="button" onClick={() => setEditing(true)}>Editar</button>}
            </header>
            {editing ? (
              <ActivityForm
                key={selected.id || 'new'}
                initial={{
                  title: selected.title,
                  kind: selected.kind,
                  description: selected.description,
                  startsAt: selected.startsAt,
                  endsAt: selected.endsAt,
                  locationKind: selected.locationKind,
                  location: selected.location,
                  onlineUrl: selected.onlineUrl,
                  contactName: selected.contactName,
                  contactEmail: selected.contactEmail,
                  contactPhone: selected.contactPhone,
                  registrationUrl: selected.registrationUrl,
                  linkedEntities: selected.linkedEntities,
                  flyer: selected.flyer,
                  featured: selected.featured,
                }}
                submitLabel={selected.id ? 'Guardar cambios' : 'Crear actividad'}
                saving={saving}
                onSubmit={saveActivity}
                onCancel={() => {
                  if (!selected.id) {
                    setSelected(filteredActivities[0] ?? null);
                  } else {
                    setSelected(activities.find((activity) => activity.id === selected.id) ?? selected);
                  }
                  setEditing(false);
                }}
              />
            ) : (
              <div className="activity-detail__summary">
                {selected.flyer && <img src={selected.flyer} alt={`Folleto de ${selected.title}`} />}
                <p><strong>Tipo:</strong> {kindLabel[selected.kind]}</p>
                <p><strong>Fecha:</strong> {formatDate(selected.startsAt)} — {formatDate(selected.endsAt)}</p>
                <p><strong>Modalidad:</strong> {selected.locationKind === 'virtual' ? 'Virtual' : 'Presencial'}</p>
                <p><strong>Ubicación / acceso:</strong> {selected.locationKind === 'virtual' ? selected.onlineUrl : selected.location}</p>
                <p><strong>Descripción:</strong> {selected.description || '—'}</p>
                <p><strong>Inscripción:</strong> {selected.registrationUrl || '—'}</p>
                <p><strong>Contacto:</strong> {[selected.contactName, selected.contactEmail, selected.contactPhone].filter(Boolean).join(' · ') || '—'}</p>
                <p><strong>Entidades vinculadas:</strong> {selected.linkedEntities.join(', ') || '—'}</p>
                <p><strong>Origen:</strong> {selected.source.name} ({selected.source.role}) · {selected.source.email}</p>
                <p><strong>Recibida:</strong> {formatDate(selected.createdAt)}</p>
                <button
                  className="activities-button activities-button--primary"
                  type="button"
                  onClick={() => void toggleVisibility(selected)}
                >
                  {selected.visible ? 'Ocultar actividad' : 'Aprobar y hacer visible'}
                </button>
              </div>
            )}
          </aside>
        )}
      </div>
    </main>
  );
};
