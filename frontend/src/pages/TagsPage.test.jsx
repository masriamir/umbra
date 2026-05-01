/**
 * @fileoverview Tests for the TagsPage component.
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../test/server";
import { mockColors, mockTags } from "../test/fixtures";
import { renderWithProviders } from "../test/utils";
import TagsPage from "./TagsPage";

describe("TagsPage", () => {
  describe("loading and empty states", () => {
    it("renders a spinner while tags are loading", () => {
      server.use(http.get("/api/tags/", () => new Promise(() => {})));
      renderWithProviders(<TagsPage />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("shows an empty message when there are no tags", async () => {
      server.use(http.get("/api/tags/", () => HttpResponse.json({ count: 0, next: null, previous: null, results: [] })));
      renderWithProviders(<TagsPage />);
      await screen.findByText("No tags yet. Create one to get started.");
    });
  });

  describe("tag list", () => {
    it("renders tags returned from the API", async () => {
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);
      expect(screen.getByText(mockTags[1].name)).toBeInTheDocument();
    });

    it("renders an Edit button for each tag", async () => {
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);
      expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(mockTags.length);
    });

    it("renders a Delete button for each tag", async () => {
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);
      expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(mockTags.length);
    });
  });

  describe("create tag", () => {
    it("opens the create modal when New Tag is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getByRole("button", { name: "+ New Tag" }));
      expect(screen.getByText("New Tag")).toBeInTheDocument();
    });

    it("closes the modal on Cancel", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getByRole("button", { name: "+ New Tag" }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() => expect(screen.queryByText("New Tag")).not.toBeInTheDocument());
    });

    it("submits a new tag and closes the modal on success", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getByRole("button", { name: "+ New Tag" }));
      await user.type(screen.getByPlaceholderText("Tag name"), "focus");
      await user.selectOptions(
        screen.getByRole("combobox"),
        String(mockColors[0].id),
      );
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(screen.queryByText("New Tag")).not.toBeInTheDocument());
    });

    it("keeps the modal open and shows an error when the API rejects", async () => {
      server.use(
        http.post("/api/tags/", () =>
          HttpResponse.json({ name: ["This field must be unique."] }, { status: 400 }),
        ),
      );
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getByRole("button", { name: "+ New Tag" }));
      await user.type(screen.getByPlaceholderText("Tag name"), "duplicate");
      await user.selectOptions(
        screen.getByRole("combobox"),
        String(mockColors[0].id),
      );
      await user.click(screen.getByRole("button", { name: "Save" }));

      await screen.findByText("This field must be unique.");
      expect(screen.getByText("New Tag")).toBeInTheDocument();
    });
  });

  describe("edit tag", () => {
    it("opens the edit modal pre-filled when Edit is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);

      expect(screen.getByText("Edit Tag")).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockTags[0].name)).toBeInTheDocument();
    });

    it("submits the edit and closes the modal on success", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
      const nameInput = screen.getByDisplayValue(mockTags[0].name);
      await user.clear(nameInput);
      await user.type(nameInput, "renamed");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(screen.queryByText("Edit Tag")).not.toBeInTheDocument());
    });
  });

  describe("delete tag", () => {
    it("opens the delete confirmation modal when Delete is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      expect(screen.getByText(`Delete \u201c${mockTags[0].name}\u201d?`)).toBeInTheDocument();
    });

    it("cancels the deletion when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      await waitFor(() =>
        expect(
          screen.queryByText(`Delete \u201c${mockTags[0].name}\u201d?`),
        ).not.toBeInTheDocument(),
      );
    });

    it("closes the confirmation modal after a successful delete", async () => {
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      const allDeleteBtns = screen.getAllByRole("button", { name: "Delete" });
      await user.click(allDeleteBtns[allDeleteBtns.length - 1]);

      await waitFor(() =>
        expect(
          screen.queryByText(`Delete \u201c${mockTags[0].name}\u201d?`),
        ).not.toBeInTheDocument(),
      );
    });

    it("shows an error message when the delete API call fails", async () => {
      server.use(
        http.delete("/api/tags/:id/", () =>
          HttpResponse.json({ detail: "Server error" }, { status: 500 }),
        ),
      );
      const user = userEvent.setup();
      renderWithProviders(<TagsPage />);
      await screen.findByText(mockTags[0].name);

      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
      const allDeleteBtns = screen.getAllByRole("button", { name: "Delete" });
      await user.click(allDeleteBtns[allDeleteBtns.length - 1]);

      await screen.findByText("Failed to delete tag.");
    });
  });
});
