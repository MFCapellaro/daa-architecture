import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { EMPTY_POOL, type PoolInput } from '../types/pool';

const inputClass = 'pool-form__input';
type PoolTextField = Exclude<keyof PoolInput, 'targetQuantity' | 'unitPrice' | 'discountedUnitPrice' | 'images'>;

const toLocalDateTime = (value: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const compressImage = async (file: File): Promise<string> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Las imágenes deben ser JPG, PNG o WebP.');
  }
  if (file.size > 12 * 1024 * 1024) throw new Error('Cada imagen original debe pesar menos de 12 MB.');

  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`No se pudo leer ${file.name}.`));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }

  const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudieron optimizar las imágenes.');
  let quality = 0.78;
  const render = () => {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  };
  let result = render();
  while (result.length > 440_000) {
    if (quality > 0.48) {
      quality = Math.max(0.45, quality - 0.08);
    } else {
      const nextSize = Math.round(Math.max(canvas.width, canvas.height) * 0.8);
      if (nextSize < 240) throw new Error(`No se pudo optimizar ${file.name} lo suficiente.`);
      const resize = nextSize / Math.max(canvas.width, canvas.height);
      canvas.width = Math.max(1, Math.round(canvas.width * resize));
      canvas.height = Math.max(1, Math.round(canvas.height * resize));
      quality = 0.78;
    }
    result = render();
  }
  return result;
};

interface PoolFormProps {
  initial?: PoolInput;
  saving: boolean;
  onCancel: () => void;
  onSave: (input: PoolInput) => Promise<void>;
}

const textFields: Array<[PoolTextField, string, boolean]> = [
  ['product', 'Producto', true],
  ['brand', 'Marca', true],
  ['model', 'Modelo', false],
  ['city', 'Ciudad', true],
  ['province', 'Provincia', true],
  ['deliveryAvailability', 'Disponibilidad y plazo estimado de entrega', false],
  ['paymentConditions', 'Condiciones de pago', false],
  ['warranty', 'Garantía', false],
  ['training', 'Capacitación incluida', false],
  ['afterSales', 'Servicio post venta', false],
  ['restrictions', 'Requisitos y restricciones', false],
];

export const PoolForm: React.FC<PoolFormProps> = ({ initial, saving, onCancel, onSave }) => {
  const [form, setForm] = useState<PoolInput>(() => ({
    ...EMPTY_POOL,
    ...initial,
    validUntil: toLocalDateTime(initial?.validUntil ?? ''),
    images: initial?.images ?? [],
  }));
  const [formError, setFormError] = useState<string | null>(null);
  const [processingImages, setProcessingImages] = useState(false);

  const setField = <K extends keyof PoolInput>(key: K, value: PoolInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setTextField = (key: PoolTextField, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const addImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (!files.length) return;
    setFormError(null);
    setProcessingImages(true);
    try {
      if (form.images.length + files.length > 5) throw new Error('Puedes adjuntar hasta 5 imágenes por pool.');
      const images = await Promise.all(files.map(compressImage));
      setField('images', [...form.images, ...images]);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudieron procesar las imágenes.');
    } finally {
      setProcessingImages(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const validUntil = new Date(form.validUntil);
    if (!Number.isFinite(validUntil.getTime())) {
      setFormError('Indica una fecha de vigencia válida.');
      return;
    }
    setFormError(null);
    void onSave({ ...form, validUntil: validUntil.toISOString() });
  };

  return (
    <form className="pool-form" onSubmit={submit}>
      {formError && <p className="pool-message pool-message--error" role="alert">{formError}</p>}
      <div className="pool-form__grid">
        {textFields.slice(0, 5).map(([key, label, required]) => (
          <label key={key} className="pool-form__field">{label}
            <input className={inputClass} required={required} value={form[key]}
              onChange={(event) => setTextField(key, event.target.value)} />
          </label>
        ))}
        <label className="pool-form__field">Cantidad objetivo del pool
          <input className={inputClass} type="number" min="1" max="100000" step="1" required
            value={form.targetQuantity} onChange={(event) => setField('targetQuantity', Number(event.target.value))} />
        </label>
        <label className="pool-form__field">Precio unitario
          <input className={inputClass} type="number" min="0" step="0.01" required
            value={form.unitPrice} onChange={(event) => setField('unitPrice', Number(event.target.value))} />
        </label>
        <label className="pool-form__field">Precio unitario con descuento por cantidad
          <input className={inputClass} type="number" min="0" step="0.01" required
            value={form.discountedUnitPrice} onChange={(event) => setField('discountedUnitPrice', Number(event.target.value))} />
        </label>
        <label className="pool-form__field">Vigencia
          <input className={inputClass} type="datetime-local" required value={form.validUntil}
            onChange={(event) => setField('validUntil', event.target.value)} />
        </label>
        {textFields.slice(5).map(([key, label]) => (
          <label key={key} className="pool-form__field">{label}
            <textarea className={inputClass} rows={2} value={form[key]}
              onChange={(event) => setTextField(key, event.target.value)} />
          </label>
        ))}
        <label className="pool-form__field pool-form__field--wide">Descripción
          <textarea className={inputClass} rows={3} maxLength={3000} value={form.description}
            onChange={(event) => setField('description', event.target.value)} />
        </label>
      </div>
      <section className="pool-form__images" aria-label="Imágenes del producto">
        <div>
          <h3>Imágenes del producto</h3>
          <p>Hasta 5 fotos; se optimizan automáticamente a JPG y 1200 px como máximo.</p>
        </div>
        <label className="pool-button pool-button--secondary">
          Agregar imágenes
          <input className="pool-form__file" type="file" accept="image/jpeg,image/png,image/webp" multiple
            onChange={(event) => void addImages(event)} disabled={saving || processingImages || form.images.length >= 5} />
        </label>
        {processingImages && <p className="pool-card__description" role="status">Optimizando imágenes…</p>}
        <div className="pool-form__previews">
          {form.images.map((image, index) => (
            <figure key={`${index}-${image.slice(-20)}`}>
              <img src={image} alt={`Imagen ${index + 1} del producto`} />
              <button type="button" aria-label={`Quitar imagen ${index + 1}`} onClick={() =>
                setField('images', form.images.filter((_, imageIndex) => imageIndex !== index))
              }>×</button>
            </figure>
          ))}
        </div>
      </section>
      <div className="pool-form__actions">
        <button className="pool-button pool-button--primary" type="submit" disabled={saving || processingImages || !form.images.length}>
          {saving ? 'Guardando…' : 'Guardar pool'}
        </button>
        <button className="pool-button pool-button--secondary" type="button" onClick={onCancel} disabled={saving}>Cancelar</button>
      </div>
    </form>
  );
};
