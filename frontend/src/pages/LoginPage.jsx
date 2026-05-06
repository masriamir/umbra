/**
 * @fileoverview Login page with username/password form.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

/**
 * Login form page. Redirects to / if already authenticated.
 *
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-surface border border-rule rounded-xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-bold text-body mb-6">Sign in to Umbra</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-secondary mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-rule bg-canvas text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-secondary mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-rule bg-canvas text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && (
            <p role="alert" className="text-red-500 text-sm mb-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
