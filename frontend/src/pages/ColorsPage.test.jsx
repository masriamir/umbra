/**
 * @fileoverview Tests for the ColorsPage component.
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../test/server";
import { mockColors } from "../test/fixtures";
import { renderWithProviders } from "../test/utils";
import ColorsPage from "./ColorsPage";

describe("ColorsPage", () => {
  describe("loading and empty states", () => {
    it("renders a spinner while colors are loading", () => {
      server.use(http.get("/api/colors/", () => new Promise(() => {})));
      renderWithProviders(<ColorsPage />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("shows an empty message when there are no colors", async () => {
      server.use(http.get("/api/colors/", () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] })));
      renderWithProviders(<ColorsPage />);
      await screen.findByText("No colors yet. Create one to get started.");
    });
  });

  describe("color list", () => {
    it("renders colors returned from the API", async () => {
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);
      expect(screen.getByText(mockColors[1].name)).toBeInTheDocument();
    });

    it("renders the hex code for each color", async () => {
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].hex_code);
      expect(screen.getByText(mockColors[1].hex_code)).toBeInTheDocument();
    });

    it("renders an Edit button for each color", async () => {
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);
      expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(mockColors.length);
    });

    it("renders a Delete button for each color", async () => {
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);
      expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(mockColors.length);
    });
  });

  describe("create color", () => {
    it("opens the create modal when New Color is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getByRole("button", { name: "+ New Color" }));
      expect(screen.getByText("New Color")).toBeInTheDocument();
    });

    it("closes the modal on Cancel", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getByRole("button", { name: "+ New Color" }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() => expect(screen.queryByText("New Color")).not.toBeInTheDocument());
    });

    it("submits a new color and closes the modal on success", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getByRole("button", { name: "+ New Color" }));
      await user.type(screen.getByPlaceholderText("Color name"), "Green");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(screen.queryByText("New Color")).not.toBeInTheDocument());
    });

    it("keeps the modal open and shows an error when the API rejects", async () => {
      server.use(
        http.post("/api/colors/", () =>
          HttpResponse.json({ name: ["This field must be unique."] }, { status: 400 }),
        ),
      );
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getByRole("button", { name: "+ New Color" }));
      await user.type(screen.getByPlaceholderText("Color name"), "duplicate");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await screen.findByText("This field must be unique.");
      expect(screen.getByText("New Color")).toBeInTheDocument();
    });
  });

  describe("edit color", () => {
    it("opens the edit modal pre-filled when Edit is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);

      expect(screen.getByText("Edit Color")).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockColors[0].name)).toBeInTheDocument();
    });

    it("submits the edit and closes the modal on success", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
      const nameInput = screen.getByDisplayValue(mockColors[0].name);
      await user.clear(nameInput);
      await user.type(nameInput, "Crimson");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(screen.queryByText("Edit Color")).not.toBeInTheDocument());
    });
  });

  describe("delete color", () => {
    it("opens the delete confirmation modal when Delete is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      expect(screen.getByText(`Delete \u201c${mockColors[0].name}\u201d?`)).toBeInTheDocument();
    });

    it("cancels the deletion when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() =>
        expect(
          screen.queryByText(`Delete \u201c${mockColors[0].name}\u201d?`),
        ).not.toBeInTheDocument(),
      );
    });

    it("closes the confirmation modal after a successful delete", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      const allDeleteBtns = screen.getAllByRole("button", { name: "Delete" });
      await user.click(allDeleteBtns[allDeleteBtns.length - 1]);

      await waitFor(() =>
        expect(
          screen.queryByText(`Delete \u201c${mockColors[0].name}\u201d?`),
        ).not.toBeInTheDocument(),
      );
    });

    it("shows a backend error message when the color is in use", async () => {
      server.use(
        http.delete("/api/colors/:id/", () =>
          HttpResponse.json(
            { detail: "This color is in use by a list or tag and cannot be deleted." },
            { status: 400 },
          ),
        ),
      );
      const user = userEvent.setup();
      renderWithProviders(<ColorsPage />);
      await screen.findByText(mockColors[0].name);

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      const allDeleteBtns = screen.getAllByRole("button", { name: "Delete" });
      await user.click(allDeleteBtns[allDeleteBtns.length - 1]);

      await screen.findByText(
        "This color is in use by a list or tag and cannot be deleted.",
      );
    });
  });
});
