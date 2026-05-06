/**
 * @fileoverview Hook for consuming the authentication context.
 */

import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

/**
 * Returns the current authentication context.
 *
 * @throws {Error} If used outside of AuthProvider.
 * @returns {import("../context/AuthContext").AuthContextValue}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
