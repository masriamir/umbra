import { useState } from "react";

import { useColors } from "../../hooks/useColors";
import TagSelector from "../ui/TagSelector";

const IMPORTANCE_OPTIONS = [
  { value: 0, label: "None" },
  { value: 1, label: "High" },
  { value: 5, label: "Medium" },
  { value: 9, label: "Low" },
];

export default function ItemForm({ initialValues, onSubmit, onCancel, isPending }) {
  const { data: colors = [] } = useColors();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [tagIds, setTagIds] = useState(initialValues?.tags?.map((t) => t.id) ?? []);
  const [dueDate, setDueDate] = useState(
    initialValues?.due_date
      ? new Date(initialValues.due_date).toISOString().slice(0, 16)
      : "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialValues?.duration_minutes ?? "",
  );
  const [importance, setImportance] = useState(initialValues?.importance ?? 0);
  const [completed, setCompleted] = useState(initialValues?.completed ?? false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        tag_ids: tagIds,
        due_date: dueDate || null,
        duration_minutes: durationMinutes !== "" ? parseInt(durationMinutes, 10) : null,
        importance,
        completed,
      });
    } catch (e) {
      const detail = e?.response?.data;
      setError(
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Failed to save item.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {initialValues ? "Edit Item" : "New Item"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          required
          maxLength={64}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          maxLength={256}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details…"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <TagSelector
          selectedIds={tagIds}
          onChange={setTagIds}
          availableColors={colors}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importance
          </label>
          <select
            value={importance}
            onChange={(e) => setImportance(parseInt(e.target.value, 10))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {IMPORTANCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="30"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="completed"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="completed" className="text-sm text-gray-700">
          Mark as completed
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
