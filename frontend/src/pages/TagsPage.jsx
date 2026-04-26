/**
 * @fileoverview Tags management page — full CRUD for Tag resources.
 */

import { useState } from "react";

import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from "../hooks/useTags";
import { useColors } from "../hooks/useColors";
import ErrorMessage from "../components/ui/ErrorMessage";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import TagBadge from "../components/ui/TagBadge";

/**
 * Inline form for creating or editing a tag.
 *
 * @param {object} props
 * @param {object|null} props.initialValues - Tag to edit, or null for create.
 * @param {boolean} props.isPending - Whether a mutation is in flight.
 * @param {Function} props.onSubmit - Called with `{name, color_id}`.
 * @param {Function} props.onCancel - Called when the user cancels.
 * @returns {JSX.Element}
 */
function TagForm({ initialValues, isPending, onSubmit, onCancel }) {
  const { data: colors = [] } = useColors();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [colorId, setColorId] = useState(initialValues?.color?.id ?? "");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !colorId) return;
    setError(null);
    try {
      await onSubmit({ name: name.trim(), color_id: Number(colorId) });
    } catch (err) {
      const detail = err?.response?.data;
      setError(
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Failed to save tag.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">{initialValues ? "Edit Tag" : "New Tag"}</h2>

      <div>
        <label className="block text-sm font-medium text-secondary mb-1">Name</label>
        <input
          type="text"
          required
          maxLength={32}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tag name"
          className="w-full border border-rule rounded-lg px-3 py-2 text-sm bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-1">Color</label>
        <select
          required
          value={colorId}
          onChange={(e) => setColorId(e.target.value)}
          className="w-full border border-rule rounded-lg px-3 py-2 text-sm bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a color…</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.hex_code})
            </option>
          ))}
        </select>
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
          disabled={isPending || !name.trim() || !colorId}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary-hover transition-colors"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/**
 * Tags management page with a list of all tags and controls to create, edit, and delete.
 *
 * @returns {JSX.Element}
 */
export default function TagsPage() {
  const { data: tags, isLoading, error } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTag(null);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteTag.mutateAsync(deletingTag.id);
      setDeletingTag(null);
    } catch {
      setDeleteError("Failed to delete tag.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-body">Tags</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
        >
          + New Tag
        </button>
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}

      {tags && tags.length === 0 && (
        <p className="text-secondary text-sm">No tags yet. Create one to get started.</p>
      )}

      {tags && tags.length > 0 && (
        <div className="bg-surface border border-rule rounded-xl overflow-hidden">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between px-4 py-3 border-b border-rule last:border-0 hover:bg-inset transition-colors"
            >
              <TagBadge tag={tag} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="text-xs text-secondary hover:text-body px-2 py-1 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingTag(tag)}
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
          <TagForm
            initialValues={editingTag}
            isPending={editingTag ? updateTag.isPending : createTag.isPending}
            onSubmit={async (data) => {
              if (editingTag) {
                await updateTag.mutateAsync({ id: editingTag.id, data });
              } else {
                await createTag.mutateAsync(data);
              }
              handleCloseForm();
            }}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}

      {deletingTag && (
        <Modal onClose={() => setDeletingTag(null)}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Delete &ldquo;{deletingTag.name}&rdquo;?</h2>
            <p className="text-sm text-secondary">
              This tag will be removed from all items that use it.
            </p>
            {deleteError && <p className="text-sm text-danger">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingTag(null)}
                className="px-4 py-2 text-sm text-secondary hover:text-body"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteTag.isPending}
                className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-danger-hover transition-colors"
              >
                {deleteTag.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
