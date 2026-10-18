import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ActivityForm } from '../../components/ActivityForm';
import { useAuth } from '../../context/AuthContext';
import { EMPTY_ACTIVITY } from '../../types/activity';
import type { ActivityInput } from '../../types/activity';
import './ActivitySubmissionPage.css';

export const ActivitySubmissionPage: React.FC = () => {
  const { user, token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (activity: ActivityInput) => {
    if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || `No se pudo enviar la actividad (${response.status}).`);
      setSubmitted(true);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo enviar la actividad.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="activity-submission">
      <section className="activity-submission__card">
        <Link className="activity-submission__back" to="/portal">← Volver a Mi Perfil</Link>
        {submitted ? (
          <div className="activity-submission__success" role="status">
            <span aria-hidden="true">✓</span>
            <h1>Actividad enviada</h1>
            <p>La publicación se hará efectiva luego de la revisión del equipo, dentro de las próximas 24 a 48 horas.</p>
            <p>El BackOffice recibió una nueva actividad pendiente de revisión.</p>
            <button type="button" onClick={() => setSubmitted(false)}>Publicar otra actividad</button>
          </div>
        ) : (
          <>
            <p className="activity-submission__eyebrow">Publicación del ecosistema</p>
            <h1>Compartir una actividad</h1>
            <p className="activity-submission__intro">
              Publica capacitaciones, cursos, expos, aplicaciones a campo y otras actividades relacionadas al ecosistema.
            </p>
            <p className="activity-submission__attribution">
              Se enviará como {user?.role === 'dealer' ? 'Dealer' : 'Participante'}: <strong>{user?.name}</strong>
            </p>
            {error && <p className="activity-submission__error" role="alert">{error}</p>}
            <ActivityForm
              key={submitted ? 'submitted' : 'new-activity'}
              initial={EMPTY_ACTIVITY}
              submitLabel="Enviar para revisión"
              saving={saving}
              onSubmit={submit}
            />
            <p className="activity-submission__notice">
              Tu actividad quedará oculta mientras se revisa. Te informaremos aquí cuando sea enviada; la publicación se realiza en un plazo estimado de 24 a 48 horas.
            </p>
          </>
        )}
      </section>
    </main>
  );
};
