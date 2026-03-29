import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import TagBadge from "../ui/TagBadge";
import DragHandle from "./DragHandle";
import ItemCheckbox from "./ItemCheckbox";

const IMPORTANCE_STYLES = {
  1: { label: "High", className: "text-red-600 font-semibold" },
  5: { label: "Med", className: "text-amber-600 font-semibold" },
  9: { label: "Low", className: "text-gray-400" },
};

export default function ItemRow({ item, onEdit, onDelete, onToggleComplete, onExport }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100"
    >
      <DragHandle {...attributes} {...listeners} />
      <ItemCheckbox
        checked={item.completed}
        onChange={() => onToggleComplete(item)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p
            className={`font-medium text-sm leading-snug ${
              item.completed ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {item.title}
          </p>
          {IMPORTANCE_STYLES[item.importance] && (
            <span className={`text-xs shrink-0 ${IMPORTANCE_STYLES[item.importance].className}`}>
              {IMPORTANCE_STYLES[item.importance].label}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
        {item.due_date && (
          <p className="text-xs text-gray-400 mt-1">
            Due {new Date(item.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onExport(item)}
          className="text-xs text-emerald-600 hover:underline"
          title="Export to calendar"
        >
          Export
        </button>
        <button
          onClick={() => onEdit(item)}
          className="text-xs text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          className="text-xs text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
