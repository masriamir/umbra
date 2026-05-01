/**
 * @fileoverview Custom render helper wrapping components with all required providers.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";

/**
 * Renders a React element inside QueryClientProvider, MemoryRouter, and AuthProvider.
 *
 * Each call creates a fresh QueryClient with retries disabled so tests don't
 * wait for retry back-off when testing error states. AuthProvider resolves
 * session state via MSW — use server.use() overrides to control auth behaviour.
 *
 * @param {React.ReactElement} ui - The component to render.
 * @param {object} [options]
 * @param {string} [options.route="/"] - Initial URL for the MemoryRouter.
 * @returns {import("@testing-library/react").RenderResult}
 */
export function renderWithProviders(ui, { route = "/" } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
