import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Activity } from '../types/activity';
import './ActivitiesPage.css';

const monthValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
};

const activityKind: Record<Activity['kind'], string> = {
  training: 'Capacitación',
  course: 'Curso',
  expo: 'Expo',
  'field-application': 'Aplicación a campo',
  event: 'Evento',
  other: 'Actividad',
};

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [month, setMonth] = useState(() => monthValue(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/activities')
      .then(async (response) => {
        const result = await response.json() as Activity[] | { message?: string };
        if (!response.ok) throw new Error(!Array.isArray(result) && result.message
          ? result.message
          : `No se pudieron cargar las actividades (${response.status}).`);
        if (!Array.isArray(result)) throw new Error('La respuesta de actividades no es válida.');
        if (active) setActivities(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las actividades.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const monthActivities = useMemo(() => activities.filter((activity) =>
    monthValue(new Date(activity.startsAt)) === month
  ), [activities, month]);

  const allMonths = useMemo(() => [...new Set(activities.map((activity) => monthValue(new Date(activity.startsAt))))]
    .sort(), [activities]);

  return (
    <main className="activities-page">
      <div className="activities-page__inner">
        <header className="activities-page__header">
          <div>
            <p className="activities-page__eyebrow">Ecosistema DronsAir</p>
            <h1>Calendario de actividades</h1>
            <p>Capacitaciones, cursos, exposiciones, aplicaciones a campo y encuentros.</p>
          </div>
          <Link to="/portal/actividades">Publicar actividad</Link>
        </header>
        <section className="activities-calendar" aria-labelledby="activities-month">
          <div className="activities-calendar__toolbar">
            <div>
              <p className="activities-page__eyebrow">Agenda</p>
              <h2 id="activities-month">{monthLabel(month)}</h2>
            </div>
            <div className="activities-calendar__month-controls">
              <button type="button" aria-label="Mes anterior" onClick={() => {
                const [year, currentMonth] = month.split('-').map(Number);
                setMonth(monthValue(new Date(year, currentMonth - 2, 1)));
              }}>‹</button>
              <input aria-label="Seleccionar mes" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
              <button type="button" aria-label="Mes siguiente" onClick={() => {
                const [year, currentMonth] = month.split('-').map(Number);
                setMonth(monthValue(new Date(year, currentMonth, 1)));
              }}>›</button>
            </div>
          </div>
          {loading ? <p className="activities-calendar__empty">Cargando actividades…</p> : error ? (
            <p role="alert" className="activities-calendar__error">{error}</p>
          ) : monthActivities.length ? (
            <div className="activities-calendar__list">
              {monthActivities.map((activity) => {
                const starts = new Date(activity.startsAt);
                const ends = new Date(activity.endsAt);
                return (
                  <article className="activity-card" key={activity.id}>
                    <div className="activity-card__date">
                      <span>{new Intl.DateTimeFormat('es-AR', { day: '2-digit' }).format(starts)}</span>
                      <small>{new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(starts).replace('.', '')}</small>
                    </div>
                    <div className="activity-card__content">
                      <div className="activity-card__meta">
                        <span>{activityKind[activity.kind]}</span>
                        {activity.featured && <span className="activity-card__featured">Destacada</span>}
                      </div>
                      <h3>{activity.title}</h3>
                      <p className="activity-card__date-line">
                        {new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeStyle: 'short' }).format(starts)}
                        {starts.toDateString() !== ends.toDateString()
                          ? ` — ${new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(ends)}`
                          : ` — ${new Intl.DateTimeFormat('es-AR', { timeStyle: 'short' }).format(ends)}`}
                      </p>
                      <p className="activity-card__location">
                        {activity.locationKind === 'virtual' ? 'Virtual' : activity.location}
                      </p>
                      {activity.description && <p className="activity-card__description">{activity.description}</p>}
                      {activity.linkedEntities.length > 0 && (
                        <p className="activity-card__entities">{activity.linkedEntities.join(' · ')}</p>
                      )}
                      {(activity.registrationUrl || activity.contactEmail) && (
                        <div className="activity-card__actions">
                          {activity.registrationUrl && <a href={activity.registrationUrl} target="_blank" rel="noreferrer">Inscribirse / más información</a>}
                          {activity.contactEmail && <a href={`mailto:${activity.contactEmail}`}>Contactar</a>}
                        </div>
                      )}
                    </div>
                    {activity.flyer && <img className="activity-card__flyer" src={activity.flyer} alt={`Folleto digital de ${activity.title}`} loading="lazy" />}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="activities-calendar__empty">
              <p>No hay actividades publicadas para {monthLabel(month)}.</p>
              {allMonths.length > 0 && <label>
                Ver agenda
                <select value={month} onChange={(event) => setMonth(event.target.value)}>
                  {allMonths.map((value) => <option key={value} value={value}>{monthLabel(value)}</option>)}
                </select>
              </label>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
