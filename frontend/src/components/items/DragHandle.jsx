export default function DragHandle(props) {
  return (
    <button
      type="button"
      {...props}
      className="text-muted hover:text-secondary cursor-grab active:cursor-grabbing touch-none p-1 shrink-0 focus:outline-none"
      aria-label="Drag to reorder"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="15" cy="19" r="1.5" />
      </svg>
    </button>
  );
}
