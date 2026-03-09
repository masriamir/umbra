import { getContrastTextColor } from "../../utils/colorUtils";

export default function TagBadge({ tag }) {
  const bg = tag.color.hex_code;
  const text = getContrastTextColor(bg);
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {tag.name}
    </span>
  );
}
