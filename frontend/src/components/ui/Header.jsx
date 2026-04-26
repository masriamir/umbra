/**
 * @fileoverview Shared application header component.
 */

/**
 * Sun icon used to indicate "switch to light mode".
 *
 * @returns {JSX.Element}
 */
function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/**
 * Moon icon used to indicate "switch to dark mode".
 *
 * @returns {JSX.Element}
 */
function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Application-wide header displaying the app name and dark mode toggle.
 *
 * @param {object} props
 * @param {boolean} props.darkMode - Whether dark mode is currently active.
 * @param {Function} props.onToggle - Callback invoked when the toggle is clicked.
 * @returns {JSX.Element}
 */
export default function Header({ darkMode, onToggle }) {
  return (
    <header className="bg-surface border-b border-rule sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="text-4xl font-bold text-body tracking-tight">Umbra</span>
        <button
          onClick={onToggle}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-lg text-secondary hover:text-body hover:bg-faint transition-colors"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
