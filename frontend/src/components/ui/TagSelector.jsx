import { useState } from "react";

import { useCreateTag } from "../../hooks/useTags";
import { useTags } from "../../hooks/useTags";
import TagBadge from "./TagBadge";

export default function TagSelector({ selectedIds, onChange, availableColors }) {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColorId, setNewColorId] = useState("");
  const [error, setError] = useState(null);

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((t) => t !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleCreateTag = async () => {
    if (!newName.trim() || !newColorId) return;
    setError(null);
    try {
      const tag = await createTag.mutateAsync({ name: newName.trim(), color_id: newColorId });
      onChange([...selectedIds, tag.id]);
      setNewName("");
      setNewColorId("");
      setShowNew(false);
    } catch (e) {
      const detail = e?.response?.data;
      setError(
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Failed to create tag.",
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`transition-opacity ${selectedIds.includes(tag.id) ? "opacity-100 ring-2 ring-offset-1 ring-gray-600 rounded-full" : "opacity-50 hover:opacity-80"}`}
          >
            <TagBadge tag={tag} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowNew((s) => !s)}
          className="text-xs text-blue-600 hover:underline"
        >
          + New tag
        </button>
      </div>

      {showNew && (
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            placeholder="Tag name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newColorId}
            onChange={(e) => setNewColorId(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Color…</option>
            {(availableColors ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={!newName.trim() || !newColorId || createTag.isPending}
            className="bg-blue-600 text-white px-2 py-1 rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
          {error && <p className="text-xs text-red-600 w-full">{error}</p>}
        </div>
      )}
    </div>
  );
}
