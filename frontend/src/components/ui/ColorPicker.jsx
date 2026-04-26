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
          className="w-9 h-9 rounded-full border-2 border-dashed border-rule flex items-center justify-center text-muted hover:border-secondary hover:text-secondary transition-colors text-lg leading-none"
          title="Custom color"
        >
          +
        </button>
      </div>

      {showCustom && (
        <div className="space-y-3 p-4 border border-rule rounded-xl bg-inset">
          <HexColorPicker color={customHex} onChange={setCustomHex} style={{ width: "100%" }} />
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-8 h-8 rounded-full border border-rule shrink-0"
              style={{ backgroundColor: customHex }}
            />
            <span className="text-sm text-secondary font-mono">{customHex}</span>
          </div>
          <input
            type="text"
            placeholder={`Name (default: ${customHex})`}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full border border-rule rounded-lg px-3 py-1.5 text-sm bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveCustom}
              disabled={createColor.isPending}
              className="flex-1 bg-primary text-white rounded-lg py-1.5 text-sm font-medium disabled:opacity-50 hover:bg-primary-hover transition-colors"
            >
              {createColor.isPending ? "Saving…" : "Save & Use"}
            </button>
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="px-3 py-1.5 text-sm text-secondary hover:text-body transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
