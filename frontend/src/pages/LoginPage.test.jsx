/**
 * @fileoverview Tests for the LoginPage component.
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { server } from "../test/server";
import { renderWithProviders } from "../test/utils";
import LoginPage from "./LoginPage";

/**
 * Renders LoginPage with a sibling / route so navigation can be verified.
 *
 * @param {object} [options]
 * @param {string} [options.route="/login"]
 */
function renderLoginPage({ route = "/login" } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<div>Dashboard</div>} />
    </Routes>,
    { route },
  );
}

describe("LoginPage", () => {
  describe("rendering", () => {
    it("renders username and password fields and a sign-in button", () => {
      server.use(
        http.get("/api/auth/me/", () => new HttpResponse(null, { status: 403 })),
      );
      renderLoginPage();
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    });
  });

  describe("login flow", () => {
    it("navigates to / after successful login", async () => {
      server.use(
        http.get("/api/auth/me/", () => new HttpResponse(null, { status: 403 })),
      );
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(await screen.findByLabelText("Username"), "testuser");
      await user.type(screen.getByLabelText("Password"), "testpass");
      await user.click(screen.getByRole("button", { name: "Sign in" }));

      await screen.findByText("Dashboard");
    });

    it("shows an error message on failed login", async () => {
      server.use(
        http.get("/api/auth/me/", () => new HttpResponse(null, { status: 403 })),
        http.post("/api/auth/login/", () =>
          new HttpResponse(null, { status: 401 }),
        ),
      );
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(await screen.findByLabelText("Username"), "bad");
      await user.type(screen.getByLabelText("Password"), "wrong");
      await user.click(screen.getByRole("button", { name: "Sign in" }));

      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid username or password.",
      );
    });

    it("disables the submit button while submitting", async () => {
      server.use(
        http.get("/api/auth/me/", () => new HttpResponse(null, { status: 403 })),
        http.post("/api/auth/login/", () => new Promise(() => {})),
      );
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(await screen.findByLabelText("Username"), "testuser");
      await user.type(screen.getByLabelText("Password"), "testpass");
      await user.click(screen.getByRole("button", { name: "Sign in" }));

      await screen.findByRole("button", { name: "Signing in…" });
      expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
    });
  });

  describe("redirect when already authenticated", () => {
    it("redirects to / immediately if already logged in", async () => {
      // Default MSW handler returns mockUser, so auth check passes
      renderLoginPage();
      await screen.findByText("Dashboard");
      await waitFor(() =>
        expect(screen.queryByLabelText("Username")).not.toBeInTheDocument(),
      );
    });
  });
});
