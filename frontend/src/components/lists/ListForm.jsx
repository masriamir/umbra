import { useState } from "react";

import ColorPicker from "../ui/ColorPicker";

export default function ListForm({ initialValues, onSubmit, onCancel, isPending }) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [color, setColor] = useState(initialValues?.color ?? null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!color) {
      setError("Please select a color.");
      return;
    }
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), color_id: color.id });
    } catch (e) {
      const detail = e?.response?.data;
      setError(
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Failed to save list.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {initialValues ? "Edit List" : "New List"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-secondary mb-1">Name</label>
        <input
          type="text"
          required
          maxLength={32}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List name"
          className="w-full border border-rule rounded-lg px-3 py-2 text-sm bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-1">Description</label>
        <textarea
          maxLength={256}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this list for? (optional)"
          rows={2}
          className="w-full border border-rule rounded-lg px-3 py-2 text-sm bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary mb-2">Color</label>
        <ColorPicker value={color} onChange={setColor} />
        {color && (
          <p className="text-xs text-muted mt-1">
            Selected: {color.name} ({color.hex_code})
          </p>
        )}
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
          disabled={isPending || !name.trim() || !color}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary-hover transition-colors"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
