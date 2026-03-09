import { useState } from "react";
import { HexColorPicker } from "react-colorful";

import { useColors, useCreateColor } from "../../hooks/useColors";
import ColorSwatch from "./ColorSwatch";

export default function ColorPicker({ value, onChange }) {
  const { data: colors = [] } = useColors();
  const createColor = useCreateColor();
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState("#3b82f6");
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState(null);

  const handleSaveCustom = async () => {
    setError(null);
    try {
      const name = customName.trim() || customHex;
      const newColor = await createColor.mutateAsync({ name, hex_code: customHex });
      onChange(newColor);
      setShowCustom(false);
      setCustomName("");
    } catch (e) {
      const detail = e?.response?.data;
      setError(
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Failed to save color.",
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {colors.map((color) => (
          <ColorSwatch
            key={color.id}
            hexCode={color.hex_code}
            selected={value?.id === color.id}
            onClick={() => onChange(color)}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowCustom((s) => !s)}
          className="w-9 h-9 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:border-gray-600 hover:text-gray-600 transition-colors text-lg leading-none"
          title="Custom color"
        >
          +
        </button>
      </div>

      {showCustom && (
        <div className="space-y-3 p-4 border rounded-xl bg-gray-50">
          <HexColorPicker color={customHex} onChange={setCustomHex} style={{ width: "100%" }} />
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-8 h-8 rounded-full border border-gray-300 shrink-0"
              style={{ backgroundColor: customHex }}
            />
            <span className="text-sm text-gray-600 font-mono">{customHex}</span>
          </div>
          <input
            type="text"
            placeholder={`Name (default: ${customHex})`}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveCustom}
              disabled={createColor.isPending}
              className="flex-1 bg-blue-600 text-white rounded-lg py-1.5 text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {createColor.isPending ? "Saving…" : "Save & Use"}
            </button>
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
