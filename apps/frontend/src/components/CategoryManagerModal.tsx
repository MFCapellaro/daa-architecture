import { useState, type FormEvent } from 'react';
import type { Category } from '../types/category';
import './CategoryManagerModal.css';

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
  onReorder: (categoryIds: string[]) => Promise<void>;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  categories,
  onClose,
  onSave,
  onDelete,
  onReorder,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
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

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (savingOrder || targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setSavingOrder(true);
    setError(null);
    try {
      await onReorder(reordered.map((category) => category.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cambiar el orden.');
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div
      className="category-modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="category-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-manager-title"
      >
        <header className="category-modal-header">
          <div>
            <h2 id="category-manager-title">Administrar categorías</h2>
            <p>
              Reordena las categorías. El orden se refleja en el mapa y en los selectores.
            </p>
          </div>
          <button className="category-modal-close" type="button" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        {error && <p className="category-modal-error" role="alert">{error}</p>}

        <ul className="category-modal-list">
          {categories.map((category) => {
            const depth = getCategoryDepth(category, categories);
            return (
              <li
                key={category.id}
                className="category-modal-item"
                style={{ paddingLeft: depth * 14 }}
              >
                <span className="category-modal-name">
                  <span className="category-modal-color" style={{ backgroundColor: category.color }} aria-hidden="true" />
                  {category.name}
                </span>
                <span className="category-modal-actions">
                  <button
                    className="category-modal-icon-button"
                    type="button"
                    onClick={() => void moveCategory(categories.indexOf(category), -1)}
                    disabled={savingOrder || categories.indexOf(category) === 0}
                    aria-label={`Subir ${category.name}`}
                    title="Subir"
                  >↑</button>
                  <button
                    className="category-modal-icon-button"
                    type="button"
                    onClick={() => void moveCategory(categories.indexOf(category), 1)}
                    disabled={savingOrder || categories.indexOf(category) === categories.length - 1}
                    aria-label={`Bajar ${category.name}`}
                    title="Bajar"
                  >↓</button>
                  <button className="category-modal-action" type="button" onClick={() => beginEdit(category)}>Editar</button>
                  <button className="category-modal-action category-modal-action--danger" type="button" onClick={() => void remove(category)}>Borrar</button>
                </span>
              </li>
            );
          })}
        </ul>

        <form onSubmit={submit} className="category-modal-form">
          <h3>{editingId ? 'Editar categoría' : 'Nueva categoría'}</h3>
          <label>
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <div className="category-modal-form-row">
            <label>
              Color
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
            </label>
            <label>
              Categoría padre
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
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
          <div className="category-modal-form-actions">
            <button className="category-modal-submit" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
            </button>
            {editingId && <button className="category-modal-action" type="button" onClick={resetForm}>Cancelar edición</button>}
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