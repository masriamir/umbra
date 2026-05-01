/**
 * @fileoverview Auth API — login, logout, and current-user endpoints.
 */

import client from "./client";

/**
 * Authenticate with username and password.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const login = (username, password) =>
  client.post("/auth/login/", { username, password });

/**
 * End the current session.
 *
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const logout = () => client.post("/auth/logout/");

/**
 * Fetch the authenticated user's profile.
 *
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const getMe = () => client.get("/auth/me/");
