import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "../api/items";

export const useItems = (listId) =>
  useQuery({
    queryKey: ["items", listId],
    queryFn: () => api.listItems(listId),
    enabled: !!listId,
  });

export const useCreateItem = (listId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createItem(listId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items", listId] }),
  });
};

export const useUpdateItem = (listId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }) => api.updateItem(listId, itemId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items", listId] }),
  });
};

export const useDeleteItem = (listId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => api.deleteItem(listId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items", listId] }),
  });
};

export const useReorderItems = (listId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order) => api.reorderItems(listId, order),
    onMutate: async (order) => {
      await qc.cancelQueries({ queryKey: ["items", listId] });
      const prev = qc.getQueryData(["items", listId]);
      if (prev) {
        const itemMap = Object.fromEntries(prev.map((i) => [i.id, i]));
        qc.setQueryData(
          ["items", listId],
          order.map((id, idx) => ({ ...itemMap[id], priority: idx })),
        );
      }
      return { prev };
    },
    onError: (_err, _order, ctx) => {
      if (ctx?.prev) qc.setQueryData(["items", listId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["items", listId] }),
  });
};
