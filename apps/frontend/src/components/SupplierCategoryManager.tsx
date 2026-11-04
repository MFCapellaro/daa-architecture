import React, { useState, type FormEvent } from "react";
import "./SupplierCategoryManager.css";

export type SupplierAttributeType = "text" | "number" | "boolean" | "select";
export type SupplierAttribute = {
  key: string;
  label: string;
  type: SupplierAttributeType;
  unit?: string;
  options?: string[];
  comparable: boolean;
};
export type SupplierCategory = {
  id: string;
  label: string;
  order: number;
  subcategories: string[];
  attributes: SupplierAttribute[];
};
export type SupplierCategoryInput = Omit<SupplierCategory, "id" | "order">;

interface SupplierCategoryManagerProps {
  categories: SupplierCategory[];
  onClose: () => void;
  onSave: (id: string | null, input: SupplierCategoryInput) => Promise<void>;
  onDelete: (category: SupplierCategory) => Promise<void>;
  onReorder: (ids: string[]) => Promise<void>;
}

const EMPTY_INPUT: SupplierCategoryInput = { label: "", subcategories: [], attributes: [] };

export const SupplierCategoryManager: React.FC<SupplierCategoryManagerProps> = ({
  categories,
  onClose,
  onSave,
  onDelete,
  onReorder,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [input, setInput] = useState<SupplierCategoryInput>(EMPTY_INPUT);
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beginEdit = (category: SupplierCategory) => {
    setEditingId(category.id);
    setInput({
      label: category.label,
      subcategories: [...category.subcategories],
      attributes: category.attributes.map((attribute) => ({ ...attribute, options: attribute.options?.slice() })),
    });
    setError(null);
  };

  const reset = () => {
    setEditingId(null);
    setInput(EMPTY_INPUT);
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(editingId, input);
      reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (savingOrder || target < 0 || target >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSavingOrder(true);
    setError(null);
    try {
      await onReorder(reordered.map((category) => category.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo cambiar el orden.");
    } finally {
      setSavingOrder(false);
    }
  };

  const updateAttribute = (index: number, patch: Partial<SupplierAttribute>) =>
    setInput((current) => ({
      ...current,
      attributes: current.attributes.map((attribute, attributeIndex) =>
        attributeIndex === index ? { ...attribute, ...patch } : attribute),
    }));

  return (
    <div className="supplier-category-backdrop" role="presentation" onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="supplier-category-modal" role="dialog" aria-modal="true" aria-labelledby="supplier-category-title">
        <header className="supplier-category-header">
          <div>
            <h2 id="supplier-category-title">Administrar categorías Suppliers</h2>
            <p>Ordena categorías y define los atributos que se usarán para comparar modelos dentro de cada categoría.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">×</button>
        </header>
        {error && <p className="supplier-category-error" role="alert">{error}</p>}
        <ul className="supplier-category-list">
          {categories.map((category, index) => (
            <li key={category.id}>
              <span><strong>{category.label}</strong><small>{category.attributes.filter((attribute) => attribute.comparable).length} atributos comparables</small></span>
              <div>
                <button type="button" aria-label={`Subir ${category.label}`} disabled={savingOrder || index === 0} onClick={() => void move(index, -1)}>↑</button>
                <button type="button" aria-label={`Bajar ${category.label}`} disabled={savingOrder || index === categories.length - 1} onClick={() => void move(index, 1)}>↓</button>
                <button type="button" onClick={() => beginEdit(category)}>Editar</button>
                <button className="supplier-category-delete" type="button" onClick={async () => {
                  if (!window.confirm(`¿Eliminar la categoría "${category.label}"? Solo es posible si no tiene productos.`)) return;
                  try {
                    await onDelete(category);
                    if (editingId === category.id) reset();
                  } catch (cause) {
                    setError(cause instanceof Error ? cause.message : "No se pudo eliminar la categoría.");
                  }
                }}>Borrar</button>
              </div>
            </li>
          ))}
        </ul>

        <form className="supplier-category-form" onSubmit={(event) => void submit(event)}>
          <h3>{editingId ? "Editar categoría" : "Crear categoría"}</h3>
          <label>Nombre<input value={input.label} maxLength={120} required onChange={(event) =>
            setInput((current) => ({ ...current, label: event.target.value }))} /></label>
          <label>Subcategorías (una por línea)<textarea rows={3} value={input.subcategories.join("\n")} onChange={(event) =>
            setInput((current) => ({
              ...current,
              subcategories: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
            }))} /></label>

          <div className="supplier-category-attributes-header">
            <div><h4>Atributos específicos</h4><small>La clave admite rutas como `motor.potencia_hp`. Los campos vacíos siguen pendientes, no equivalen a “No”.</small></div>
            <button type="button" onClick={() => setInput((current) => ({
              ...current,
              attributes: [...current.attributes, { key: "", label: "", type: "text", comparable: true }],
            }))}>+ Atributo</button>
          </div>
          <div className="supplier-category-attributes">
            {input.attributes.map((attribute, index) => (
              <fieldset key={`${attribute.key}-${index}`}>
                <div className="supplier-category-attribute-grid">
                  <label>Clave<input value={attribute.key} placeholder="potencia_hp" onChange={(event) => updateAttribute(index, { key: event.target.value })} /></label>
                  <label>Etiqueta<input value={attribute.label} placeholder="Potencia" onChange={(event) => updateAttribute(index, { label: event.target.value })} /></label>
                  <label>Tipo<select value={attribute.type} onChange={(event) => updateAttribute(index, {
                    type: event.target.value as SupplierAttributeType,
                    ...(event.target.value === "select" ? { options: attribute.options ?? [] } : { options: undefined }),
                  })}>
                    <option value="text">Texto</option><option value="number">Número</option>
                    <option value="boolean">Sí / No</option><option value="select">Selección</option>
                  </select></label>
                  <label>Unidad<input value={attribute.unit ?? ""} placeholder="L, HP…" onChange={(event) => updateAttribute(index, { unit: event.target.value })} /></label>
                </div>
                {attribute.type === "select" && <label>Opciones (separadas por coma)<input
                  value={(attribute.options ?? []).join(", ")}
                  onChange={(event) => updateAttribute(index, {
                    options: event.target.value.split(",").map((option) => option.trim()).filter(Boolean),
                  })} /></label>}
                <div className="supplier-category-attribute-footer">
                  <label><input type="checkbox" checked={attribute.comparable} onChange={(event) => updateAttribute(index, { comparable: event.target.checked })} /> Incluir en comparaciones</label>
                  <button type="button" onClick={() => setInput((current) => ({
                    ...current,
                    attributes: current.attributes.filter((_, attributeIndex) => attributeIndex !== index),
                  }))}>Quitar atributo</button>
                </div>
              </fieldset>
            ))}
            {!input.attributes.length && <p>Esta categoría no tiene atributos definidos todavía.</p>}
          </div>
          <div className="supplier-category-form-actions">
            <button className="supplier-category-save" type="submit" disabled={saving}>{saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear categoría"}</button>
            {editingId && <button type="button" onClick={reset}>Cancelar edición</button>}
          </div>
        </form>
      </section>
    </div>
  );
};
