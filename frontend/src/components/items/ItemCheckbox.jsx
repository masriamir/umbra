export default function ItemCheckbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-0.5 w-4 h-4 rounded border-rule text-primary focus:ring-primary cursor-pointer shrink-0"
    />
  );
}
