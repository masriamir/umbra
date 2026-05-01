/**
 * @fileoverview Authentication context, provider, and hook for session-based auth.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as authApi from "../api/auth";

/**
 * @typedef {{ user: object|null, loading: boolean, login: Function, logout: Function }} AuthContextValue
 */

/** @type {React.Context<AuthContextValue|null>} */
export const AuthContext = createContext(null);

/**
 * Provides authentication state to the component tree.
 *
 * Checks the current session on mount via GET /auth/me/. Exposes login
 * and logout actions that update state and navigate appropriately.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    authApi
      .getMe()
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Authenticate and navigate to /.
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  async function login(username, password) {
    const { data } = await authApi.login(username, password);
    setUser(data);
    navigate("/");
  }

  /**
   * End the session and navigate to /login.
   *
   * @returns {Promise<void>}
   */
  async function logout() {
    await authApi.logout();
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Returns the current authentication context.
 *
 * @throws {Error} If used outside of AuthProvider.
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
