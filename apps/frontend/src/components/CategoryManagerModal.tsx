import { useState, type FormEvent } from 'react';
import type { Category } from '../types/category';

interface CategoryInput {
  name: string;
  color: string;
  parentId?: string;
}

interface CategoryManagerModalProps {
  categories: Category[];
  onClose: () => void;
  onSave: (categoryId: string | null, category: CategoryInput) => Promise<void>;
  onDelete: (category: Category) => Promise<void>;
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '8px',
  border: '1px solid #cbd5e1',
  borderRadius: '5px',
};

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setColor('#2563eb');
    setParentId('');
    setError(null);
  };

  const beginEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color);
    setParentId(category.parentId ?? '');
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(editingId, {
        name: name.trim(),
        color,
        parentId: parentId || undefined,
      });
      resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    setError(null);
    try {
      await onDelete(category);
      if (editingId === category.id) resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la categoría.');
    }
  };

  return (
    <div
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(15, 23, 42, .55)',
        padding: 16,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-manager-title"
        style={{
          width: 'min(640px, 100%)',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: 10,
          background: '#fff',
          padding: 22,
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 id="category-manager-title" style={{ margin: 0 }}>Administrar categorías</h2>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              Organiza las categorías en niveles y asígnalas a varios actores.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}

        <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0' }}>
          {categories.map((category) => {
            const depth = getCategoryDepth(category, categories);
            return (
              <li
                key={category.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '9px 4px',
                  borderBottom: '1px solid #e2e8f0',
                  paddingLeft: depth * 18,
                }}
              >
                <span>
                  <span style={{ color: category.color, marginRight: 8 }}>●</span>
                  {category.name}
                </span>
                <span style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => beginEdit(category)}>Editar</button>
                  <button type="button" onClick={() => void remove(category)}>Borrar</button>
                </span>
              </li>
            );
          })}
        </ul>

        <form onSubmit={submit} style={{ display: 'grid', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          <h3 style={{ margin: 0 }}>{editingId ? 'Editar categoría' : 'Nueva categoría'}</h3>
          <label>
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12 }}>
            <label>
              Color
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                style={{ ...inputStyle, height: 38, padding: 3 }}
              />
            </label>
            <label>
              Categoría padre
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
                style={inputStyle}
              >
                <option value="">Sin categoría padre</option>
                {categories
                  .filter((category) => category.id !== editingId)
                  .map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
            </button>
            {editingId && <button type="button" onClick={resetForm}>Cancelar edición</button>}
          </div>
        </form>
      </section>
    </div>
  );
};

const getCategoryDepth = (category: Category, categories: Category[]): number => {
  let depth = 0;
  let parentId = category.parentId;
  const visited = new Set<string>([category.id]);

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = categories.find((candidate) => candidate.id === parentId);
    if (!parent) break;
    depth += 1;
    parentId = parent.parentId;
  }

  return depth;
};