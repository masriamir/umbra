import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "../api/colors";

export const useColors = () =>
  useQuery({ queryKey: ["colors"], queryFn: api.listColors });

export const useCreateColor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createColor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colors"] }),
  });
};

export const useUpdateColor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateColor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colors"] }),
  });
};

export const useDeleteColor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteColor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colors"] }),
  });
};
