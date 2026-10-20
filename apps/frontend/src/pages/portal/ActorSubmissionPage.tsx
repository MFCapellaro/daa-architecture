import React, { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Category } from '../../types/category';
import './UserPortalPage.css';

type ActorType = 'company' | 'person' | 'institution' | 'manufacturer' | 'supplier' | 'dealer'
  | 'service' | 'operator' | 'organization' | 'community' | 'training' | 'other';

interface ActorSubmission {
  id: string;
  name: string;
  type: ActorType;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewMessage?: string;
}

const emptyContact = {
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  province: '',
  country: '',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 6,
  padding: '11px 12px',
  border: '1px solid #343840',
  borderRadius: 7,
  color: '#eceef2',
  background: '#202329',
  font: 'inherit',
  fontSize: 14,
};

const actorTypeLabels: Record<ActorType, string> = {
  company: 'Empresa',
  person: 'Persona',
  institution: 'Institución',
  manufacturer: 'Fabricante',
  supplier: 'Proveedor',
  dealer: 'Dealer',
  service: 'Servicio',
  operator: 'Operador',
  organization: 'Organización',
  community: 'Comunidad',
  training: 'Formación',
  other: 'Otro',
};

const statusLabels = { pending: 'En revisión', approved: 'Aprobada', rejected: 'Requiere cambios' };

export const ActorSubmissionPage: React.FC = () => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState<ActorType>('company');
  const [description, setDescription] = useState('');
  const [layers, setLayers] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contact, setContact] = useState(emptyContact);
  const [submissions, setSubmissions] = useState<ActorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadSubmissions = async () => {
      if (!token) {
        setError('Tu sesión expiró. Inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/actors/submissions/mine', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const result = await response.json() as ActorSubmission[] | { message?: string };
        if (!response.ok) throw new Error(!Array.isArray(result) ? result.message || 'No se pudieron cargar tus propuestas.' : 'No se pudieron cargar tus propuestas.');
        if (!Array.isArray(result)) throw new Error('La respuesta de propuestas no es válida.');
        if (active) setSubmissions(result);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar tus propuestas.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadSubmissions();
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json() as Array<{ id: string; label: string; color?: string; parentId?: string }> | { error?: string };
        if (!response.ok) throw new Error(!Array.isArray(result) ? result.error || 'No se pudieron cargar las categorías.' : 'No se pudieron cargar las categorías.');
        if (!Array.isArray(result)) throw new Error('La respuesta de categorías no es válida.');
        if (active) setCategories(result.map((category) => ({
          id: category.id,
          name: category.label,
          color: category.color ?? '#64748b',
          parentId: category.parentId,
        })));
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las categorías.');
      }
    };
    void loadCategories();
    return () => { active = false; };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError('Tu sesión expiró. Inicia sesión nuevamente.');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/actors/submissions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, description, layers, contact }),
      });
      const result = await response.json() as { submission?: ActorSubmission; message?: string };
      if (!response.ok) throw new Error(result.message || `No se pudo enviar la propuesta (${response.status}).`);
      if (!result.submission) throw new Error('La respuesta del servidor no contiene la propuesta creada.');
      setSubmissions((current) => [result.submission!, ...current]);
      setName('');
      setType('company');
      setDescription('');
      setLayers([]);
      setContact(emptyContact);
      setNotice(result.message || 'La propuesta fue enviada al BackOffice para revisión.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la propuesta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="user-portal">
      <section className="user-portal__card">
        <h1 className="user-portal__title">Publicar un actor</h1>
        <p className="user-portal__intro">Propón una empresa, persona u organización vinculada al ecosistema. El equipo revisará la información antes de incorporarla al directorio.</p>
        <nav className="user-portal__nav" aria-label="Mi perfil">
          <Link to="/portal">Mi Perfil</Link>
          <Link to="/portal/actores">Publicar un actor</Link>
        </nav>
        {error && <p role="alert" className="user-portal__message user-portal__message--error">{error}</p>}
        {notice && <p role="status" className="user-portal__message user-portal__message--success">{notice}</p>}
        <form onSubmit={(event) => void submit(event)} className="user-portal__form">
          <label>Nombre del actor<input required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} /></label>
          <label>Tipo de actor
            <select value={type} onChange={(event) => setType(event.target.value as ActorType)} style={inputStyle}>
              {Object.entries(actorTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Descripción<textarea rows={4} maxLength={3000} value={description} onChange={(event) => setDescription(event.target.value)} style={inputStyle} /></label>
          <fieldset style={{ margin: 0, padding: 14, border: '1px solid #343840', borderRadius: 8 }}>
            <legend style={{ padding: '0 6px', color: '#c6c8ce', fontSize: 13 }}>Categorías</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {categories.map((category) => (
                <label key={category.id} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c6c8ce', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={layers.includes(category.id)}
                    onChange={(event) => setLayers((current) => event.target.checked
                      ? [...current, category.id]
                      : current.filter((item) => item !== category.id))}
                  />
                  {category.name}
                </label>
              ))}
              {categories.length === 0 && <p className="user-portal__copy">No hay categorías disponibles para asignar.</p>}
            </div>
          </fieldset>
          <h2 className="user-portal__section-title">Contacto y ubicación</h2>
          {([
            ['email', 'Correo electrónico', 'email'],
            ['phone', 'Teléfono', 'tel'],
            ['website', 'Sitio web', 'url'],
            ['address', 'Dirección', 'text'],
            ['city', 'Ciudad', 'text'],
            ['province', 'Provincia', 'text'],
            ['country', 'País', 'text'],
          ] as const).map(([key, label, inputType]) => (
            <label key={key}>{label}
              <input
                type={inputType}
                maxLength={key === 'email' ? 254 : key === 'website' ? 500 : key === 'address' ? 300 : 120}
                value={contact[key]}
                onChange={(event) => setContact((current) => ({ ...current, [key]: event.target.value }))}
                style={inputStyle}
              />
            </label>
          ))}
          <button className="user-portal__submit" type="submit" disabled={saving}>{saving ? 'Enviando…' : 'Enviar para revisión'}</button>
        </form>
        <section style={{ marginTop: 36 }}>
          <h2 className="user-portal__section-title">Mis propuestas</h2>
          {loading ? <p className="user-portal__copy">Cargando propuestas…</p> : submissions.length === 0
            ? <p className="user-portal__copy">Todavía no enviaste propuestas.</p>
            : <ul style={{ display: 'grid', gap: 12, margin: 0, padding: 0, listStyle: 'none' }}>
              {submissions.map((submission) => (
                <li key={submission.id} style={{ padding: 14, border: '1px solid #343840', borderRadius: 8, background: '#1d1f24' }}>
                  <strong>{submission.name}</strong> <span style={{ color: '#a3a6ae' }}>· {actorTypeLabels[submission.type]} · {statusLabels[submission.status]}</span>
                  {submission.reviewMessage && <p className="user-portal__copy" style={{ margin: '8px 0 0' }}>{submission.reviewMessage}</p>}
                </li>
              ))}
            </ul>}
        </section>
      </section>
    </main>
  );
};
