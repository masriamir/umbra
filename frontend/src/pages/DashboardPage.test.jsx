/**
 * @fileoverview Tests for the DashboardPage component.
 */

import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../test/server";
import { mockStats } from "../test/fixtures";
import { renderWithProviders } from "../test/utils";
import DashboardPage from "./DashboardPage";

describe("DashboardPage", () => {
  describe("loading and error states", () => {
    it("renders a spinner while stats are loading", () => {
      server.use(http.get("/api/stats/", () => new Promise(() => {})));
      renderWithProviders(<DashboardPage />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders an error message when the API fails", async () => {
      server.use(
        http.get("/api/stats/", () =>
          HttpResponse.json({ detail: "Internal server error" }, { status: 500 }),
        ),
      );
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Internal server error");
    });
  });

  /** Returns the value element (nextElementSibling) for a stat card label. */
  function getStatValue(labelText) {
    return screen.getByText(labelText).nextElementSibling;
  }

  describe("stat cards", () => {
    it("renders the correct totals", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Dashboard");

      expect(getStatValue("Lists")).toHaveTextContent(String(mockStats.totals.lists));
      expect(getStatValue("Total Items")).toHaveTextContent(String(mockStats.totals.items));
      expect(getStatValue("Active")).toHaveTextContent(String(mockStats.totals.active_items));
      expect(getStatValue("Completed")).toHaveTextContent(String(mockStats.totals.completed_items));
      expect(getStatValue("Colors")).toHaveTextContent(String(mockStats.totals.colors));
      expect(getStatValue("Tags")).toHaveTextContent(String(mockStats.totals.tags));
    });

    it("renders due date counts", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Dashboard");

      expect(getStatValue("Overdue")).toHaveTextContent(String(mockStats.overdue_items));
      expect(getStatValue("Due This Week")).toHaveTextContent(String(mockStats.items_due_this_week));
      expect(getStatValue("No Due Date (Active)")).toHaveTextContent(String(mockStats.items_without_due_date));
    });

    it("applies danger accent to overdue count when overdue > 0", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Dashboard");

      const overdueLabel = screen.getByText("Overdue");
      const overdueValue = overdueLabel.nextElementSibling;
      expect(overdueValue).toHaveClass("text-danger");
    });

    it("applies caution accent to due-this-week count when due > 0", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Dashboard");

      const label = screen.getByText("Due This Week");
      const valueEl = label.nextElementSibling;
      expect(valueEl).toHaveClass("text-caution");
    });

    it("uses neutral accent for overdue when count is 0", async () => {
      server.use(
        http.get("/api/stats/", () =>
          HttpResponse.json({ ...mockStats, overdue_items: 0 }),
        ),
      );
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Dashboard");

      const overdueLabel = screen.getByText("Overdue");
      const overdueValue = overdueLabel.nextElementSibling;
      expect(overdueValue).not.toHaveClass("text-danger");
      expect(overdueValue).toHaveClass("text-body");
    });

    it("renders importance breakdown counts", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Dashboard");

      expect(getStatValue("High")).toHaveTextContent(String(mockStats.importance_breakdown.high));
      expect(getStatValue("Medium")).toHaveTextContent(String(mockStats.importance_breakdown.medium));
      expect(getStatValue("Low")).toHaveTextContent(String(mockStats.importance_breakdown.low));
    });
  });

  describe("top lists table", () => {
    it("renders list names from top_lists", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Work");
      expect(screen.getByText("Personal")).toBeInTheDocument();
    });

    it("renders each list name as a link to its detail page", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Work");

      const workLink = screen.getByRole("link", { name: "Work" });
      expect(workLink).toHaveAttribute("href", `/lists/${mockStats.top_lists[0].id}`);
    });

    it("renders a View all link to /lists", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Dashboard");

      const viewAllLink = screen.getByRole("link", { name: "View all →" });
      expect(viewAllLink).toHaveAttribute("href", "/lists");
    });

    it("shows an empty message when top_lists is empty", async () => {
      server.use(
        http.get("/api/stats/", () =>
          HttpResponse.json({ ...mockStats, top_lists: [] }),
        ),
      );
      renderWithProviders(<DashboardPage />);
      await screen.findByText("No lists yet.");
    });
  });

  describe("top tags table", () => {
    it("renders tag names from top_tags", async () => {
      renderWithProviders(<DashboardPage />);
      await waitFor(() => {
        expect(screen.getAllByText("urgent").length).toBeGreaterThan(0);
      });
    });

    it("renders a Manage link to /tags", async () => {
      renderWithProviders(<DashboardPage />);
      await screen.findByText("Dashboard");

      const manageLink = screen.getByRole("link", { name: "Manage →" });
      expect(manageLink).toHaveAttribute("href", "/tags");
    });

    it("shows an empty message when top_tags is empty", async () => {
      server.use(
        http.get("/api/stats/", () =>
          HttpResponse.json({ ...mockStats, top_tags: [] }),
        ),
      );
      renderWithProviders(<DashboardPage />);
      await screen.findByText("No tags yet.");
    });
  });
});
