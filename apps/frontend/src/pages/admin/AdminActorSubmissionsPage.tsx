import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ActorSubmission {
  id: string;
  name: string;
  type: string;
  description: string;
  layers: string[];
  contact: Record<string, string>;
  source: { name: string; email: string; role: string };
  status: 'pending' | 'approved' | 'rejected';
  reviewMessage?: string;
  createdAt: string;
}

const pageStyle: React.CSSProperties = { minHeight: 'calc(100vh - 64px)', padding: 32, color: '#e5e7eb', background: '#101114' };
const cardStyle: React.CSSProperties = { padding: 20, border: '1px solid #2b2e35', borderRadius: 10, background: '#17181c' };

export const AdminActorSubmissionsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [submissions, setSubmissions] = useState<ActorSubmission[]>([]);
  const [reviewMessages, setReviewMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) throw new Error('La sesión administrativa expiró. Inicia sesión nuevamente.');
    const response = await fetch('/api/admin/actors/submissions', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const result = await response.json() as ActorSubmission[] | { message?: string };
    if (response.status === 401) {
      logout();
      throw new Error('La sesión administrativa expiró. Inicia sesión nuevamente.');
    }
    if (!response.ok) throw new Error(!Array.isArray(result) ? result.message || 'No se pudieron cargar las propuestas.' : 'No se pudieron cargar las propuestas.');
    if (!Array.isArray(result)) throw new Error('La respuesta de propuestas no es válida.');
    setSubmissions(result);
  }, [token, logout]);

  useEffect(() => {
    let active = true;
    void load().catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las propuestas.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);

  const review = async (submission: ActorSubmission, status: 'approved' | 'rejected') => {
    if (!token) return;
    setBusyId(submission.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/actors/submissions/${encodeURIComponent(submission.id)}`, {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, message: reviewMessages[submission.id] || '' }),
      });
      const result = await response.json() as ActorSubmission | { message?: string };
      if (!response.ok) throw new Error(!('status' in result) ? result.message || 'No se pudo revisar la propuesta.' : 'No se pudo revisar la propuesta.');
      if (!('status' in result)) throw new Error('La respuesta de revisión no es válida.');
      setSubmissions((current) => current.map((item) => item.id === result.id ? result : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo revisar la propuesta.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0, fontSize: 28, fontWeight: 600 }}>Propuestas de actores</h1>
        <p style={{ color: '#9ca3af' }}>Revisa y aprueba los actores enviados por participantes y Dealers.</p>
        {error && <p role="alert" style={{ color: '#fca5a5' }}>{error}</p>}
        {loading ? <p>Cargando propuestas…</p> : submissions.length === 0
          ? <p style={{ color: '#9ca3af' }}>No hay propuestas de actores.</p>
          : <div style={{ display: 'grid', gap: 14 }}>
            {submissions.map((submission) => (
              <article key={submission.id} style={cardStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <h2 style={{ margin: '0 0 6px', fontSize: 19 }}>{submission.name}</h2>
                    <p style={{ margin: 0, color: '#aeb4bf', fontSize: 13 }}>
                      {submission.type} · Enviado por {submission.source.name} ({submission.source.role}) · {new Date(submission.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <strong style={{ color: submission.status === 'pending' ? '#fbbf24' : submission.status === 'approved' ? '#86efac' : '#fca5a5' }}>{submission.status}</strong>
                </div>
                {submission.description && <p style={{ color: '#d1d5db', lineHeight: 1.5 }}>{submission.description}</p>}
                <p style={{ color: '#aeb4bf', fontSize: 13 }}>{Object.entries(submission.contact).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(' · ')}</p>
                {submission.layers.length > 0 && <p style={{ color: '#aeb4bf', fontSize: 13 }}>Categorías: {submission.layers.join(', ')}</p>}
                {submission.status === 'pending' ? (
                  <>
                    <label style={{ display: 'block', marginTop: 16, color: '#cbd5e1', fontSize: 13 }}>
                      Mensaje para quien propuso el actor
                      <textarea rows={2} maxLength={600} value={reviewMessages[submission.id] || ''} onChange={(event) => setReviewMessages((current) => ({ ...current, [submission.id]: event.target.value }))} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, padding: 10, border: '1px solid #343840', borderRadius: 7, color: '#eceef2', background: '#202329', font: 'inherit' }} />
                    </label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button type="button" disabled={busyId === submission.id} onClick={() => void review(submission, 'approved')} style={{ padding: '9px 14px', border: 0, borderRadius: 6, color: '#052e16', background: '#86efac', cursor: 'pointer' }}>Aprobar y publicar</button>
                      <button type="button" disabled={busyId === submission.id} onClick={() => void review(submission, 'rejected')} style={{ padding: '9px 14px', border: '1px solid #7f1d1d', borderRadius: 6, color: '#fecaca', background: '#3f1d22', cursor: 'pointer' }}>Rechazar</button>
                    </div>
                  </>
                ) : submission.reviewMessage && <p style={{ color: '#9ca3af', fontSize: 13 }}>Mensaje: {submission.reviewMessage}</p>}
              </article>
            ))}
          </div>}
      </div>
    </main>
  );
};
