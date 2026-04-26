/**
 * @fileoverview Colors management page — full CRUD for Color resources.
 */

import { useState } from "react";
import { HexColorPicker } from "react-colorful";

import { useColors, useCreateColor, useDeleteColor, useUpdateColor } from "../hooks/useColors";
import ErrorMessage from "../components/ui/ErrorMessage";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";

/**
 * Form for creating or editing a color.
 *
 * @param {object} props
 * @param {object|null} props.initialValues - Color to edit, or null for create.
 * @param {boolean} props.isPending - Whether a mutation is in flight.
 * @param {Function} props.onSubmit - Called with `{name, hex_code}`.
 * @param {Function} props.onCancel - Called when the user cancels.
 * @returns {JSX.Element}
 */
function ColorForm({ initialValues, isPending, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [hex, setHex] = useState(initialValues?.hex_code ?? "#3b82f6");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await onSubmit({ name: name.trim(), hex_code: hex });
    } catch (err) {
      const detail = err?.response?.data;
      setError(
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Failed to save color.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">{initialValues ? "Edit Color" : "New Color"}</h2>

      <div>
        <label className="block text-sm font-medium text-secondary mb-1">Name</label>
        <input
          type="text"
          required
          maxLength={32}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Color name"
          className="w-full border border-rule rounded-lg px-3 py-2 text-sm bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-2">Color</label>
        <HexColorPicker color={hex} onChange={setHex} style={{ width: "100%" }} />
        <div className="flex items-center gap-2 mt-2">
          <div
            className="w-8 h-8 rounded-full border border-rule shrink-0"
            style={{ backgroundColor: hex }}
          />
          <span className="text-sm text-secondary font-mono">{hex}</span>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-secondary hover:text-body transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary-hover transition-colors"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/**
 * Colors management page with a grid of all colors and controls to create, edit, and delete.
 *
 * @returns {JSX.Element}
 */
export default function ColorsPage() {
  const { data: colors, isLoading, error } = useColors();
  const createColor = useCreateColor();
  const updateColor = useUpdateColor();
  const deleteColor = useDeleteColor();

  const [showForm, setShowForm] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [deletingColor, setDeletingColor] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingColor(null);
  };

  const handleEdit = (color) => {
    setEditingColor(color);
    setShowForm(true);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteColor.mutateAsync(deletingColor.id);
      setDeletingColor(null);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setDeleteError(detail ?? "Failed to delete color.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-body">Colors</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
        >
          + New Color
        </button>
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}

      {colors && colors.length === 0 && (
        <p className="text-secondary text-sm">No colors yet. Create one to get started.</p>
      )}

      {colors && colors.length > 0 && (
        <div className="bg-surface border border-rule rounded-xl overflow-hidden">
          {colors.map((color) => (
            <div
              key={color.id}
              className="flex items-center justify-between px-4 py-3 border-b border-rule last:border-0 hover:bg-inset transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full border border-rule shrink-0"
                  style={{ backgroundColor: color.hex_code }}
                />
                <div>
                  <span className="text-sm font-medium text-body">{color.name}</span>
                  <span className="ml-2 text-xs font-mono text-muted">{color.hex_code}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(color)}
                  className="text-xs text-secondary hover:text-body px-2 py-1 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingColor(color)}
                  className="text-xs text-danger hover:text-danger-hover px-2 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={handleCloseForm}>
          <ColorForm
            initialValues={editingColor}
            isPending={editingColor ? updateColor.isPending : createColor.isPending}
            onSubmit={async (data) => {
              if (editingColor) {
                await updateColor.mutateAsync({ id: editingColor.id, data });
              } else {
                await createColor.mutateAsync(data);
              }
              handleCloseForm();
            }}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}

      {deletingColor && (
        <Modal onClose={() => setDeletingColor(null)}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Delete &ldquo;{deletingColor.name}&rdquo;?</h2>
            <p className="text-sm text-secondary">
              Colors in use by a list or tag cannot be deleted.
            </p>
            {deleteError && <p className="text-sm text-danger">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingColor(null)}
                className="px-4 py-2 text-sm text-secondary hover:text-body"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteColor.isPending}
                className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-danger-hover transition-colors"
              >
                {deleteColor.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
