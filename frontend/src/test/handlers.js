/**
 * @fileoverview MSW request handlers for all API routes used in tests.
 */

import { http, HttpResponse } from "msw";

import { mockColors, mockStats, mockTags } from "./fixtures";

export const handlers = [
  // Stats
  http.get("/api/stats/", () => HttpResponse.json(mockStats)),

  // Colors
  http.get("/api/colors/", () => HttpResponse.json(mockColors)),
  http.post("/api/colors/", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 99,
        name: body.name,
        hex_code: body.hex_code,
        created_date: "2024-01-01T00:00:00Z",
        updated_date: "2024-01-01T00:00:00Z",
      },
      { status: 201 },
    );
  }),
  http.patch("/api/colors/:id/", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockColors[0], ...body });
  }),
  http.delete("/api/colors/:id/", () => new HttpResponse(null, { status: 204 })),

  // Tags
  http.get("/api/tags/", () => HttpResponse.json(mockTags)),
  http.post("/api/tags/", async ({ request }) => {
    const body = await request.json();
    const color = mockColors.find((c) => c.id === body.color_id) ?? mockColors[0];
    return HttpResponse.json(
      {
        id: 99,
        name: body.name,
        color,
        created_date: "2024-01-01T00:00:00Z",
        updated_date: "2024-01-01T00:00:00Z",
      },
      { status: 201 },
    );
  }),
  http.patch("/api/tags/:id/", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...mockTags[0], ...body });
  }),
  http.delete("/api/tags/:id/", () => new HttpResponse(null, { status: 204 })),

  // Lists (used by DashboardPage links, not primary target of these tests)
  http.get("/api/lists/", () => HttpResponse.json([])),
];
