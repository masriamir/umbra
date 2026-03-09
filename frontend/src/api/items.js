import client from "./client";

export const listItems = (listId) =>
  client.get(`/lists/${listId}/items/`).then((r) => r.data);

export const createItem = (listId, data) =>
  client.post(`/lists/${listId}/items/`, data).then((r) => r.data);

export const updateItem = (listId, itemId, data) =>
  client.patch(`/lists/${listId}/items/${itemId}/`, data).then((r) => r.data);

export const deleteItem = (listId, itemId) =>
  client.delete(`/lists/${listId}/items/${itemId}/`);

export const reorderItems = (listId, order) =>
  client.post(`/lists/${listId}/items/reorder/`, { order });
