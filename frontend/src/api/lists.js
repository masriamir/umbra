import client from "./client";

export const listTodoLists = () => client.get("/lists/").then((r) => r.data);
export const createTodoList = (data) => client.post("/lists/", data).then((r) => r.data);
export const updateTodoList = (id, data) => client.patch(`/lists/${id}/`, data).then((r) => r.data);
export const deleteTodoList = (id) => client.delete(`/lists/${id}/`);
