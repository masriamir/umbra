import client from "./client";

export const listColors = () => client.get("/colors/").then((r) => r.data.results);
export const createColor = (data) => client.post("/colors/", data).then((r) => r.data);
export const updateColor = (id, data) => client.patch(`/colors/${id}/`, data).then((r) => r.data);
export const deleteColor = (id) => client.delete(`/colors/${id}/`);
