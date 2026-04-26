/**
 * @fileoverview Tests for the Header component.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import Header from "./Header";

/**
 * Renders Header inside a MemoryRouter at the given route.
 *
 * @param {object} [props]
 * @param {boolean} [props.darkMode=false]
 * @param {Function} [props.onToggle]
 * @param {string} [props.route="/"]
 */
function renderHeader({ darkMode = false, onToggle = vi.fn(), route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Header darkMode={darkMode} onToggle={onToggle} />
    </MemoryRouter>,
  );
}

describe("Header", () => {
  describe("branding", () => {
    it("renders the Umbra title as a link to /", () => {
      renderHeader();
      const link = screen.getByRole("link", { name: "Umbra" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/");
    });
  });

  describe("navigation links", () => {
    it("renders My Lists, Tags, and Colors nav links", () => {
      renderHeader();
      expect(screen.getByRole("link", { name: "My Lists" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Tags" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Colors" })).toBeInTheDocument();
    });

    it("applies active style to My Lists link when on /lists", () => {
      renderHeader({ route: "/lists" });
      const link = screen.getByRole("link", { name: "My Lists" });
      expect(link).toHaveClass("border-primary");
    });

    it("applies active style to Tags link when on /tags", () => {
      renderHeader({ route: "/tags" });
      const link = screen.getByRole("link", { name: "Tags" });
      expect(link).toHaveClass("border-primary");
    });

    it("applies active style to Colors link when on /colors", () => {
      renderHeader({ route: "/colors" });
      const link = screen.getByRole("link", { name: "Colors" });
      expect(link).toHaveClass("border-primary");
    });

    it("does not apply active style to non-current nav links", () => {
      renderHeader({ route: "/tags" });
      expect(screen.getByRole("link", { name: "My Lists" })).not.toHaveClass("border-primary");
      expect(screen.getByRole("link", { name: "Colors" })).not.toHaveClass("border-primary");
    });
  });

  describe("dark mode toggle", () => {
    it("renders the moon icon when in light mode", () => {
      renderHeader({ darkMode: false });
      expect(screen.getByLabelText("Switch to dark mode")).toBeInTheDocument();
    });

    it("renders the sun icon when in dark mode", () => {
      renderHeader({ darkMode: true });
      expect(screen.getByLabelText("Switch to light mode")).toBeInTheDocument();
    });

    it("calls onToggle when the button is clicked", async () => {
      const onToggle = vi.fn();
      renderHeader({ onToggle });
      await userEvent.click(screen.getByLabelText("Switch to dark mode"));
      expect(onToggle).toHaveBeenCalledOnce();
    });
  });
});
