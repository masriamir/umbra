import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

/**
 * Reads the csrftoken cookie value set by Django.
 *
 * @returns {string|null}
 */
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

client.interceptors.request.use((config) => {
  if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
    const token = getCsrfToken();
    if (token) config.headers["X-CSRFToken"] = token;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default client;
