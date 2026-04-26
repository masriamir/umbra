import client from "./client";

export const fetchStats = () => client.get("/stats/").then((r) => r.data);
