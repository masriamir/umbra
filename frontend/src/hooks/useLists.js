import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "../api/lists";

export const useLists = () =>
  useQuery({ queryKey: ["lists"], queryFn: api.listTodoLists });

export const useCreateList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createTodoList,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
};

export const useUpdateList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateTodoList(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
};

export const useDeleteList = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTodoList,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
};
