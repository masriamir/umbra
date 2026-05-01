import client from "./client";

export const listTags = () => client.get("/tags/").then((r) => r.data.results);
export const createTag = (data) => client.post("/tags/", data).then((r) => r.data);
export const updateTag = (id, data) => client.patch(`/tags/${id}/`, data).then((r) => r.data);
export const deleteTag = (id) => client.delete(`/tags/${id}/`);
