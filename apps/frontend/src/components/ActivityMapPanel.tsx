import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Activity } from '../types/activity';
import './ActivityMapPanel.css';

const kindLabel: Record<Activity['kind'], string> = {
  training: 'Capacitación',
  course: 'Curso',
  expo: 'Expo',
  'field-application': 'Aplicación',
  event: 'Evento',
  other: 'Actividad',
};

const formatStart = (value: string) => {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat('es-AR', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date).replace('.', '').toUpperCase(),
    detail: new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(date),
  };
};

export const ActivityMapPanel: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
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
        if (active) {
          setActivities(result.filter((activity) => activity.featured || Date.parse(activity.startsAt) >= Date.now()).slice(0, 12));
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las actividades.');
      });
    return () => { active = false; };
  }, []);

  if (!activities.length && !error) return null;

  const selected = activities[selectedIndex % activities.length];
  const move = (direction: number) => {
    setSelectedIndex((index) => (index + direction + activities.length) % activities.length);
  };

  return (
    <section className={`map-activities${expanded ? ' is-expanded' : ''}`} aria-label="Actividades destacadas">
      <header className="map-activities__header">
        <div className="map-activities__heading">
          <span aria-hidden="true">✦</span>
          <strong>Actividades destacadas</strong>
          <Link to="/activities">Ver calendario</Link>
        </div>
        <button
          className="map-activities__collapse"
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? 'Contraer actividades' : 'Expandir actividades'}
          onClick={() => setExpanded((value) => !value)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {expanded ? <path d="m6 9 6 6 6-6" /> : <path d="m9 18 6-6-6-6" />}
          </svg>
        </button>
      </header>
      {error ? <p className="map-activities__error" role="status">{error}</p> : selected && (
        <div className="map-activities__content">
          <button className="map-activities__arrow" type="button" aria-label="Actividad anterior" onClick={() => move(-1)}>‹</button>
          {expanded ? (
            <div className="map-activities__cards">
              {activities.map((activity, index) => {
                const date = formatStart(activity.startsAt);
                return (
                  <button
                    className={`map-activity-card${index === selectedIndex ? ' is-selected' : ''}`}
                    key={activity.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                  >
                    <span className="map-activity-card__date"><strong>{date.day}</strong><small>{date.month}</small></span>
                    <span className="map-activity-card__text">
                      <small>{activity.featured ? 'DESTACADA · ' : ''}{kindLabel[activity.kind]}</small>
                      <strong>{activity.title}</strong>
                      <span>{activity.locationKind === 'virtual' ? 'Virtual' : activity.location}</span>
                      <span className="map-activity-card__start">{date.detail}</span>
                    </span>
                    {activity.flyer && <img src={activity.flyer} alt="" aria-hidden="true" loading="lazy" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <button className="map-activities__compact-card" type="button" onClick={() => setExpanded(true)}>
              <span>{formatStart(selected.startsAt).day}<small>{formatStart(selected.startsAt).month}</small></span>
              <span><strong>{selected.title}</strong><small>{selected.locationKind === 'virtual' ? 'Virtual' : selected.location}</small></span>
            </button>
          )}
          <button className="map-activities__arrow" type="button" aria-label="Actividad siguiente" onClick={() => move(1)}>›</button>
        </div>
      )}
    </section>
  );
};
