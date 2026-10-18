import React, { useState, type FormEvent } from 'react';
import type { ActivityInput } from '../types/activity';
import './ActivityForm.css';

const formatDateTimeInput = (value: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const compressFlyer = async (file: File): Promise<string> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('El folleto debe ser una imagen JPG, PNG o WebP.');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('La imagen debe pesar menos de 10 MB.');
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('No se pudo leer el folleto seleccionado.'));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const initialScale = Math.min(1, 1600 / Math.max(width, height));
  width = Math.max(1, Math.round(width * initialScale));
  height = Math.max(1, Math.round(height * initialScale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo procesar el folleto.');
  let quality = 0.84;
  let dataUrl = '';
  while (true) {
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= 1_400_000) return dataUrl;
    if (quality > 0.55) {
      quality = Math.max(0.5, quality - 0.1);
    } else {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
      quality = 0.82;
      if (Math.max(width, height) < 160) {
        throw new Error('No se pudo reducir el folleto. Prueba con otra imagen.');
      }
    }
  }
};

interface ActivityFormProps {
  initial: ActivityInput;
  submitLabel: string;
  saving?: boolean;
  onSubmit: (activity: ActivityInput) => Promise<void>;
  onCancel?: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  initial,
  submitLabel,
  saving = false,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState<ActivityInput>(initial);
  const [flyerError, setFlyerError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const update = <K extends keyof ActivityInput>(key: K, next: ActivityInput[K]) => {
    setValue((current) => ({ ...current, [key]: next }));
  };

  const changeFlyer = async (file?: File) => {
    setFlyerError(null);
    if (!file) return;
    setCompressing(true);
    try {
      update('flyer', await compressFlyer(file));
    } catch (cause) {
      setFlyerError(cause instanceof Error ? cause.message : 'No se pudo procesar el folleto.');
    } finally {
      setCompressing(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const start = new Date(value.startsAt);
    const end = new Date(value.endsAt);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) {
      setFormError('Revisa las fechas: la finalización debe ser igual o posterior al inicio.');
      return;
    }
    await onSubmit({
      ...value,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      linkedEntities: value.linkedEntities,
    });
  };

  return (
    <form className="activity-form" onSubmit={(event) => void submit(event)}>
      <label>Nombre del evento
        <input required maxLength={160} value={value.title} onChange={(event) => update('title', event.target.value)} />
      </label>
      <div className="activity-form__grid">
        <label>Tipo de actividad
          <select value={value.kind} onChange={(event) => update('kind', event.target.value as ActivityInput['kind'])}>
            <option value="training">Capacitación</option>
            <option value="course">Curso</option>
            <option value="expo">Expo</option>
            <option value="field-application">Aplicación a campo</option>
            <option value="event">Evento</option>
            <option value="other">Otra actividad del ecosistema</option>
          </select>
        </label>
        <label>Modalidad
          <select value={value.locationKind} onChange={(event) => update('locationKind', event.target.value as ActivityInput['locationKind'])}>
            <option value="in-person">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>
        </label>
      </div>
      <div className="activity-form__grid">
        <label>Fecha y hora de inicio
          <input required type="datetime-local" value={formatDateTimeInput(value.startsAt)} onChange={(event) => update('startsAt', event.target.value)} />
        </label>
        <label>Fecha y hora de finalización
          <input required type="datetime-local" value={formatDateTimeInput(value.endsAt)} onChange={(event) => update('endsAt', event.target.value)} />
        </label>
      </div>
      {value.locationKind === 'in-person' ? (
        <label>Ubicación presencial
          <input required maxLength={240} placeholder="Dirección, localidad, provincia" value={value.location} onChange={(event) => update('location', event.target.value)} />
        </label>
      ) : (
        <label>Enlace de acceso virtual
          <input required type="url" placeholder="https://" value={value.onlineUrl} onChange={(event) => update('onlineUrl', event.target.value)} />
        </label>
      )}
      <label>Descripción
        <textarea rows={3} maxLength={3000} value={value.description} onChange={(event) => update('description', event.target.value)} />
      </label>
      <fieldset>
        <legend>Contacto e inscripción</legend>
        <div className="activity-form__grid">
          <label>Persona de contacto
            <input maxLength={120} value={value.contactName} onChange={(event) => update('contactName', event.target.value)} />
          </label>
          <label>Correo de contacto
            <input type="email" maxLength={254} value={value.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} />
          </label>
          <label>Teléfono
            <input type="tel" maxLength={60} value={value.contactPhone} onChange={(event) => update('contactPhone', event.target.value)} />
          </label>
          <label>Enlace de entrada o inscripción
            <input type="url" placeholder="https://" value={value.registrationUrl} onChange={(event) => update('registrationUrl', event.target.value)} />
          </label>
        </div>
      </fieldset>
      <label>Entidades vinculadas
        <textarea
          rows={2}
          placeholder="Una entidad por línea"
          value={value.linkedEntities.join('\n')}
          onChange={(event) => update('linkedEntities', event.target.value.split('\n').map((entity) => entity.trim()).filter(Boolean))}
        />
      </label>
      <label className="activity-form__flyer-label">Folleto digital
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => void changeFlyer(event.target.files?.[0])}
          disabled={saving || compressing}
          required={!value.flyer}
        />
        <small>JPG, PNG o WebP. El archivo se optimiza para su publicación.</small>
      </label>
      {value.flyer && <img className="activity-form__flyer-preview" src={value.flyer} alt="Vista previa del folleto" />}
      <label className="activity-form__checkbox">
        <input type="checkbox" checked={value.featured} onChange={(event) => update('featured', event.target.checked)} />
        Marcar como actividad destacada
      </label>
      {flyerError && <p role="alert" className="activity-form__error">{flyerError}</p>}
      {formError && <p role="alert" className="activity-form__error">{formError}</p>}
      <div className="activity-form__actions">
        <button type="submit" disabled={saving || compressing}>
          {compressing ? 'Procesando folleto…' : saving ? 'Guardando…' : submitLabel}
        </button>
        {onCancel && <button type="button" className="activity-form__cancel" onClick={onCancel} disabled={saving}>Cancelar</button>}
      </div>
    </form>
  );
};
