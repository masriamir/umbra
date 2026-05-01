/**
 * @fileoverview Shared application header component.
 */

import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

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
 * Returns className for a nav link, applying an active style when the route matches.
 *
 * @param {object} params
 * @param {boolean} params.isActive - Whether the link's route is currently active.
 * @returns {string}
 */
function navLinkClass({ isActive }) {
  return [
    "text-sm font-medium transition-colors px-1 py-0.5 rounded",
    isActive
      ? "text-body border-b-2 border-primary"
      : "text-secondary hover:text-body",
  ].join(" ");
}

/**
 * Application-wide header displaying the app name, nav links, dark mode toggle,
 * the authenticated user's username, and a logout button.
 *
 * @param {object} props
 * @param {boolean} props.darkMode - Whether dark mode is currently active.
 * @param {Function} props.onToggle - Callback invoked when the toggle is clicked.
 * @returns {JSX.Element}
 */
export default function Header({ darkMode, onToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-surface border-b border-rule sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link
          to="/"
          className="text-4xl font-bold text-body tracking-tight shrink-0 hover:text-primary transition-colors"
        >
          Umbra
        </Link>

        <nav className="flex items-center gap-4 flex-1" aria-label="Main navigation">
          <NavLink to="/lists" className={navLinkClass}>My Lists</NavLink>
          <NavLink to="/tags" className={navLinkClass}>Tags</NavLink>
          <NavLink to="/colors" className={navLinkClass}>Colors</NavLink>
        </nav>

        <button
          onClick={onToggle}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-lg text-secondary hover:text-body hover:bg-faint transition-colors shrink-0"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>

        {user && (
          <>
            <span className="text-sm text-secondary shrink-0">{user.username}</span>
            <button
              onClick={logout}
              className="text-sm text-secondary hover:text-body transition-colors shrink-0"
            >
              Log out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
