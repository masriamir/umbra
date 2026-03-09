import { useNavigate } from "react-router-dom";

import { getContrastTextColor } from "../../utils/colorUtils";

export default function ListCard({ list, onEdit, onDelete }) {
  const navigate = useNavigate();
  const bg = list.color.hex_code;
  const text = getContrastTextColor(bg);

  return (
    <div
      onClick={() => navigate(`/lists/${list.id}`)}
      className="rounded-2xl p-6 cursor-pointer shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
      style={{ backgroundColor: bg, color: text }}
    >
      <h2 className="text-xl font-bold truncate">{list.name}</h2>
      {list.description && (
        <p className="text-sm mt-1 opacity-80 line-clamp-2">{list.description}</p>
      )}

      <div
        className="mt-4 flex gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(list)}
          className="text-sm underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: text }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(list)}
          className="text-sm underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: text }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
