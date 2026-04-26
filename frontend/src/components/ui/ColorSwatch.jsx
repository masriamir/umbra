export default function ColorSwatch({ hexCode, selected, onClick, size = "md" }) {
  const sizeClass = size === "sm" ? "w-6 h-6" : "w-9 h-9";
  return (
    <button
      type="button"
      onClick={onClick}
      title={hexCode}
      className={`${sizeClass} rounded-full transition-all focus:outline-none ${
        selected ? "ring-2 ring-offset-2 ring-body scale-110" : "hover:scale-105"
      }`}
      style={{ backgroundColor: hexCode }}
    />
  );
}
