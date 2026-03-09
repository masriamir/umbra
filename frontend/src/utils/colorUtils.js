/**
 * Expands a 3-digit hex code to 6 digits.
 * "#ABC" → "#AABBCC"
 */
function expandHex(hex) {
  const stripped = hex.replace("#", "");
  if (stripped.length === 3) {
    return stripped
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return stripped;
}

/**
 * Returns '#000000' or '#ffffff' based on the perceived luminance of the
 * background color, ensuring readable contrast (WCAG relative luminance).
 */
export function getContrastTextColor(hexCode) {
  const hex = expandHex(hexCode);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
