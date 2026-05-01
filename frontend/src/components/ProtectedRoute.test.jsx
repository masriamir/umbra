/**
 * @fileoverview Tests for the ProtectedRoute component.
 */

import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { server } from "../test/server";
import { renderWithProviders } from "../test/utils";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Renders ProtectedRoute wrapping a "/" route alongside a "/login" sentinel.
 */
function renderProtectedRoute() {
  return renderWithProviders(
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<div>Protected content</div>} />
      </Route>
      <Route path="/login" element={<div>Login page</div>} />
    </Routes>,
  );
}

describe("ProtectedRoute", () => {
  it("shows a spinner while the session check is in flight", () => {
    server.use(http.get("/api/auth/me/", () => new Promise(() => {})));
    renderProtectedRoute();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("redirects to /login when the session check returns unauthenticated", async () => {
    server.use(
      http.get("/api/auth/me/", () => new HttpResponse(null, { status: 403 })),
    );
    renderProtectedRoute();
    await screen.findByText("Login page");
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the protected content when authenticated", async () => {
    // Default MSW handler returns mockUser
    renderProtectedRoute();
    await screen.findByText("Protected content");
  });
});
