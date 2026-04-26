/**
 * @fileoverview Shared fixture data for frontend tests.
 */

export const mockColors = [
  {
    id: 1,
    name: "Red",
    hex_code: "#FF0000",
    created_date: "2024-01-01T00:00:00Z",
    updated_date: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Blue",
    hex_code: "#0000FF",
    created_date: "2024-01-01T00:00:00Z",
    updated_date: "2024-01-01T00:00:00Z",
  },
];

export const mockTags = [
  {
    id: 1,
    name: "urgent",
    color: mockColors[0],
    created_date: "2024-01-01T00:00:00Z",
    updated_date: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "work",
    color: mockColors[1],
    created_date: "2024-01-01T00:00:00Z",
    updated_date: "2024-01-01T00:00:00Z",
  },
];

export const mockStats = {
  totals: {
    lists: 3,
    items: 12,
    completed_items: 4,
    active_items: 8,
    colors: 2,
    tags: 2,
  },
  items_due_this_week: 3,
  overdue_items: 2,
  items_without_due_date: 5,
  importance_breakdown: { none: 3, high: 2, medium: 2, low: 1 },
  top_lists: [
    { id: 1, name: "Work", item_count: 7, completed_count: 3 },
    { id: 2, name: "Personal", item_count: 5, completed_count: 1 },
  ],
  top_tags: [
    { id: 1, name: "urgent", usage_count: 5 },
    { id: 2, name: "work", usage_count: 3 },
  ],
};
