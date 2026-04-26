import { useQuery } from "@tanstack/react-query";

import { fetchStats } from "../api/stats";

/**
 * Fetches aggregate dashboard statistics from the backend.
 *
 * @returns {import("@tanstack/react-query").UseQueryResult}
 */
export const useStats = () =>
  useQuery({ queryKey: ["stats"], queryFn: fetchStats });
